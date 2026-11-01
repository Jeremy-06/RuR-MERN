const User = require('../models/user');
const crypto = require('crypto')
const validator = require('validator')
const cloudinary = require('cloudinary')
const sendEmail = require('../utils/sendEmail')
const sendToken = require('../utils/jwtToken');
const { getFirebaseAuth } = require('../config/firebase')

const MIN_PASSWORD_LENGTH = 6
const USER_ROLES = ['user', 'admin']
const GOOGLE_ACCOUNT_MESSAGE = 'This account uses Google sign-in. Please continue with Google.'

const DEFAULT_AVATAR = {
    public_id: 'default_avatar',
    url: '/images/default_avatar.svg'
}

// Kapareho ng Yup schemas sa frontend
const validateUser = ({ name, email, avatar }) => {
    if (!name || !String(name).trim()) return 'Please enter your name'
    if (String(name).trim().length > 30) return 'Your name cannot exceed 30 characters'
    if (!email || !String(email).trim()) return 'Please enter your email'
    if (!validator.isEmail(String(email).trim())) return 'Please enter valid email address'
    if (avatar) {
        // Base64 data URL galing FileReader ang avatar
        if (!/^data:image\/(jpeg|png|webp);base64,/.test(avatar)) return 'Avatar must be a jpg, jpeg, png or webp image'
        if ((avatar.length - avatar.indexOf(',') - 1) * 0.75 > 5 * 1024 * 1024) return 'Avatar must be 5MB or smaller'
    }
    return null
}

// Pang-compare lang ang confirmPassword, hindi sine-save
const validatePasswords = ({ password, confirmPassword }) => {
    if (!password || typeof password !== 'string') return 'Please enter your password'
    if (password.length < MIN_PASSWORD_LENGTH) return `Your password must be at least ${MIN_PASSWORD_LENGTH} characters`
    if (!confirmPassword) return 'Please confirm your password'
    if (password !== confirmPassword) return 'Passwords do not match'
    return null
}

exports.registerUser = async (req, res, next) => {
    const { name, email, password, } = req.body || {};

    // I-validate muna bago mag-upload para walang maiwang file sa Cloudinary
    const errorMessage = validateUser(req.body || {}) || validatePasswords(req.body || {})
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

    if (!email || !password) {
        return res.status(400).json({ message: 'Please enter email & password' })
    }
    if (!validator.isEmail(String(email).trim())) {
        return res.status(400).json({ message: 'Please enter valid email address' })
    }

    let user = await User.findOne({ email: String(email).toLowerCase() }).select('+password')
    if (!user) {
        return res.status(401).json({ message: 'Invalid Email or Password' })
    }

    // Walang password ang Google-only accounts
    if (!user.password) {
        return res.status(400).json({ message: GOOGLE_ACCOUNT_MESSAGE })
    }

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

    let decoded
    try {
        decoded = await firebaseAuth.verifyIdToken(idToken)
    } catch (error) {
        return res.status(401).json({ message: 'Invalid or expired Google sign-in, please try again' })
    }
    if (!decoded.email || decoded.email_verified === false) {
        return res.status(400).json({ message: 'Your Google account has no verified email address' })
    }

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
    const user = await User.findOne({ email: String(req.body.email).toLowerCase() }).select('+password');
    if (!user) {
        return res.status(404).json({ message: 'User not found with this email' })
    }

    // Walang password na ire-reset ang Google-only accounts
    if (!user.password) {
        return res.status(400).json({ message: GOOGLE_ACCOUNT_MESSAGE })
    }

    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.FRONTEND_ORIGIN}/password/reset/${resetToken}`;
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
        console.log(`Password reset email failed: ${error.message}`)
        return res.status(500).json({ message: "We couldn't send the email right now. Please try again in a minute." })
    }
}

exports.resetPassword = async (req, res, next) => {
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex')
    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() }
    })

    if (!user) {
        return res.status(400).json({ message: 'Password reset token is invalid or has been expired' })
    }

    const errorMessage = validatePasswords(req.body || {})
    if (errorMessage) {
        return res.status(400).json({ message: errorMessage })
    }

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
    const errorMessage = validateUser(req.body || {})
    if (errorMessage) {
        return res.status(400).json({ message: errorMessage })
    }

    const newUserData = {
        name: String(req.body.name).trim(),
        email: String(req.body.email).trim().toLowerCase()
    }

    // Dapat unique ang email
    if (await User.exists({ email: newUserData.email, _id: { $ne: req.user._id } })) {
        return res.status(400).json({ message: 'Email is already registered' })
    }

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

    if (!req.body.oldPassword || typeof req.body.oldPassword !== 'string') {
        return res.status(400).json({ message: 'Please enter your old password' })
    }
    const errorMessage = validatePasswords(req.body)
    if (errorMessage) {
        return res.status(400).json({ message: errorMessage })
    }

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
    const { name, email, role } = req.body || {}

    const errorMessage = validateUser({ name, email })
    if (errorMessage) {
        return res.status(400).json({ message: errorMessage })
    }
    if (!USER_ROLES.includes(role)) {
        return res.status(400).json({ message: 'Please select a valid role' })
    }
    if (req.params.id === req.user._id.toString() && role !== 'admin') {
        return res.status(400).json({ message: 'You cannot remove your own admin role' })
    }

    const newUserData = {
        name: String(name).trim(),
        email: String(email).trim().toLowerCase(),
        role
    }

    // Dapat unique ang email
    if (await User.exists({ email: newUserData.email, _id: { $ne: req.params.id } })) {
        return res.status(400).json({ message: 'Email is already registered' })
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
        ...sendToken.cookieFlags()
    })

    return res.status(200).json({
        success: true,
        message: 'Logged out'
    })
}
