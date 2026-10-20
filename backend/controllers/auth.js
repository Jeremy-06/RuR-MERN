const User = require('../models/user');
const crypto = require('crypto')
const validator = require('validator')
const cloudinary = require('cloudinary')
const sendEmail = require('../utils/sendEmail')
const sendToken = require('../utils/jwtToken');
const { getFirebaseAuth } = require('../config/firebase')

const DEFAULT_AVATAR = {
    public_id: 'default_avatar',
    url: '/images/default_avatar.svg'
}

exports.DEFAULT_AVATAR = DEFAULT_AVATAR

// Same rules as the Yup schemas on the frontend; returns the first error message
const validateUser = ({ name, email, password, avatar }, checkPassword) => {
    if (!name || !String(name).trim()) return 'Please enter your name'
    if (String(name).trim().length > 30) return 'Your name cannot exceed 30 characters'
    if (!email || !String(email).trim()) return 'Please enter your email'
    if (!validator.isEmail(String(email).trim())) return 'Please enter valid email address'
    if (checkPassword) {
        if (!password) return 'Please enter your password'
        if (String(password).length < 6) return 'Your password must be at least 6 characters'
    }
    if (avatar) {
        // Avatars arrive as base64 data URLs from FileReader
        if (!/^data:image\/(jpeg|png|webp);base64,/.test(avatar)) return 'Avatar must be a jpg, jpeg, png or webp image'
        if ((avatar.length - avatar.indexOf(',') - 1) * 0.75 > 5 * 1024 * 1024) return 'Avatar must be 5MB or smaller'
    }
    return null
}

exports.registerUser = async (req, res, next) => {
    const { name, email, password, } = req.body || {};

    // Validate before uploading the avatar so a bad form does not leave files in Cloudinary
    const errorMessage = validateUser(req.body || {}, true)
    if (errorMessage) {
        return res.status(400).json({ message: errorMessage })
    }
    if (await User.exists({ email: String(email).trim().toLowerCase() })) {
        return res.status(400).json({ message: 'Email is already registered' })
    }

    let avatar = DEFAULT_AVATAR
    if (req.body.avatar) {
        const result = await cloudinary.v2.uploader.upload(req.body.avatar, {
            folder: 'rur/avatars',
            width: 150,
            crop: "scale"
        })
        avatar = {
            public_id: result.public_id,
            url: result.secure_url
        }
    }

    const user = await User.create({
        name: String(name).trim(),
        email,
        password,
        avatar,
    })
    user.password = undefined

    sendToken(user, 201, res)
}

exports.loginUser = async (req, res, next) => {
    const { email, password } = req.body;

    // Checks if email and password is entered by user
    if (!email || !password) {
        return res.status(400).json({ message: 'Please enter email & password' })
    }
    if (!validator.isEmail(String(email).trim())) {
        return res.status(400).json({ message: 'Please enter valid email address' })
    }

    // Finding user in database
    let user = await User.findOne({ email: String(email).toLowerCase() }).select('+password')
    if (!user) {
        return res.status(401).json({ message: 'Invalid Email or Password' })
    }

    // Google-only accounts have no password to check
    if (!user.password) {
        return res.status(400).json({ message: 'This account uses Google sign-in. Please continue with Google.' })
    }

    // Checks if password is correct or not
    const isPasswordMatched = await user.comparePassword(password);
    if (!isPasswordMatched) {
        return res.status(401).json({ message: 'Invalid Email or Password' })
    }

    user = await User.findById(user._id)
    sendToken(user, 200, res)
}

exports.googleLogin = async (req, res, next) => {
    const firebaseAuth = getFirebaseAuth()
    if (!firebaseAuth) {
        return res.status(503).json({ message: 'Google login is disabled: the Firebase service account is not configured on the server' })
    }

    const { idToken } = req.body || {};
    if (!idToken) {
        return res.status(400).json({ message: 'Google ID token is required' })
    }

    // Verify the Firebase ID token sent by the frontend
    let decoded
    try {
        decoded = await firebaseAuth.verifyIdToken(idToken)
    } catch (error) {
        return res.status(401).json({ message: 'Invalid or expired Google sign-in, please try again' })
    }
    if (!decoded.email || decoded.email_verified === false) {
        return res.status(400).json({ message: 'Your Google account has no verified email address' })
    }

    // Find the user by email or create a Google-only account
    const email = decoded.email.toLowerCase()
    let user = await User.findOne({ email })
    if (!user) {
        user = await User.create({
            name: (decoded.name || email.split('@')[0]).substring(0, 30),
            email,
            avatar: decoded.picture ? { public_id: 'google', url: decoded.picture } : DEFAULT_AVATAR,
            authProvider: 'google',
            role: 'user',
        })
    }

    sendToken(user, 200, res)
}

exports.forgotPassword = async (req, res, next) => {
    const user = await User.findOne({ email: String(req.body.email).toLowerCase() });
    if (!user) {
        return res.status(404).json({ message: 'User not found with this email' })
    }

    // Get reset token
    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    // Create reset password url
    const resetUrl = `${process.env.FRONTEND_ORIGIN || 'http://localhost:5173'}/password/reset/${resetToken}`;
    const message = `Your password reset token is as follow:\n\n${resetUrl}\n\nIf you have not requested this email, then ignore it.`
    try {
        await sendEmail({
            email: user.email,
            subject: 'RuR Password Recovery',
            message
        })

        res.status(200).json({
            success: true,
            message: `Email sent to: ${user.email}`
        })

    } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({ validateBeforeSave: false });
        return res.status(500).json({ message: error.message })
    }
}

exports.resetPassword = async (req, res, next) => {
    // Hash URL token
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex')
    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() }
    })

    if (!user) {
        return res.status(400).json({ message: 'Password reset token is invalid or has been expired' })
    }

    if (req.body.password !== req.body.confirmPassword) {
        return res.status(400).json({ message: 'Password does not match' })
    }

    // Setup new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    user.password = undefined

    sendToken(user, 200, res)
}

exports.getUserProfile = async (req, res, next) => {
    const user = await User.findById(req.user.id);

    return res.status(200).json({
        success: true,
        user
    })
}

exports.updateProfile = async (req, res, next) => {
    const errorMessage = validateUser(req.body || {}, false)
    if (errorMessage) {
        return res.status(400).json({ message: errorMessage })
    }

    const newUserData = {
        name: String(req.body.name).trim(),
        email: String(req.body.email).trim().toLowerCase()
    }

    // Email must stay unique across accounts
    if (await User.exists({ email: newUserData.email, _id: { $ne: req.user._id } })) {
        return res.status(400).json({ message: 'Email is already registered' })
    }

    // Update avatar
    if (req.body.avatar) {
        const user = await User.findById(req.user.id)
        if (user.avatar && user.avatar.public_id.startsWith('rur/avatars/')) {
            await cloudinary.v2.uploader.destroy(user.avatar.public_id);
        }
        const result = await cloudinary.v2.uploader.upload(req.body.avatar, {
            folder: 'rur/avatars',
            width: 150,
            crop: "scale"
        })

        newUserData.avatar = {
            public_id: result.public_id,
            url: result.secure_url
        }
    }
    const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
        returnDocument: 'after',
        runValidators: true,
    })
    if (!user) {
        return res.status(401).json({ message: 'User Not Updated' })
    }

    return res.status(200).json({
        success: true,
        user
    })
}

exports.updatePassword = async (req, res, next) => {
    const user = await User.findById(req.user.id).select('+password');
    if (!user.password) {
        return res.status(400).json({ message: 'This account uses Google sign-in and has no password to change' })
    }

    // Check previous user password
    const isMatched = await user.comparePassword(req.body.oldPassword)
    if (!isMatched) {
        return res.status(400).json({ message: 'Old password is incorrect' })
    }
    user.password = req.body.password;
    await user.save();
    user.password = undefined

    sendToken(user, 200, res)
}

exports.allUsers = async (req, res, next) => {
    const users = await User.find();
    res.status(200).json({
        success: true,
        users
    })
}

exports.getUserDetails = async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return res.status(404).json({ message: `User does not found with id: ${req.params.id}` })
    }

    res.status(200).json({
        success: true,
        user
    })
}

exports.updateUser = async (req, res, next) => {
    const newUserData = {
        name: req.body.name,
        email: req.body.email,
        role: req.body.role
    }

    const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
        returnDocument: 'after',
        runValidators: true,
    })
    if (!user) {
        return res.status(404).json({ message: `User does not found with id: ${req.params.id}` })
    }

    return res.status(200).json({
        success: true
    })
}

exports.deleteUser = async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return res.status(404).json({ message: `User does not found with id: ${req.params.id}` })
    }
    if (user._id.toString() === req.user._id.toString()) {
        return res.status(400).json({ message: 'You cannot delete your own account' })
    }

    // Remove avatar from cloudinary
    if (user.avatar && user.avatar.public_id.startsWith('rur/avatars/')) {
        await cloudinary.v2.uploader.destroy(user.avatar.public_id);
    }
    await User.findByIdAndDelete(req.params.id);
    return res.status(200).json({
        success: true,
    })
}

exports.logout = async (req, res, next) => {
    res.cookie('token', null, {
        expires: new Date(Date.now()),
        httpOnly: true
    })

    return res.status(200).json({
        success: true,
        message: 'Logged out'
    })
}
