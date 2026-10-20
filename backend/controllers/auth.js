const User = require('../models/user');
const crypto = require('crypto')
const cloudinary = require('cloudinary')
const sendEmail = require('../utils/sendEmail')
const sendToken = require('../utils/jwtToken');

const DEFAULT_AVATAR = {
    public_id: 'default_avatar',
    url: '/images/default_avatar.svg'
}

exports.DEFAULT_AVATAR = DEFAULT_AVATAR

exports.registerUser = async (req, res, next) => {
    const { name, email, password, } = req.body;

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

    if (await User.exists({ email: String(email).toLowerCase() })) {
        return res.status(400).json({ message: 'Email is already registered' })
    }

    const user = await User.create({
        name,
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

    // Finding user in database
    let user = await User.findOne({ email: String(email).toLowerCase() }).select('+password')
    if (!user) {
        return res.status(401).json({ message: 'Invalid Email or Password' })
    }

    // Checks if password is correct or not
    const isPasswordMatched = await user.comparePassword(password);
    if (!isPasswordMatched) {
        return res.status(401).json({ message: 'Invalid Email or Password' })
    }

    user = await User.findById(user._id)
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
    const newUserData = {
        name: req.body.name,
        email: req.body.email
    }

    // Update avatar
    if (req.body.avatar) {
        const user = await User.findById(req.user.id)
        if (user.avatar && user.avatar.public_id !== DEFAULT_AVATAR.public_id) {
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
    if (user.avatar && user.avatar.public_id !== DEFAULT_AVATAR.public_id) {
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
