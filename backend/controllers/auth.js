const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/user');

function publicUser(user) {
    return { id: user._id, name: user.name, email: user.email, role: user.role };
}

function setSessionCookie(res, user) {
    const token = jwt.sign({ sub: user._id.toString() }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.cookie('rur_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/',
    });
}

exports.register = async (req, res) => {
    const { name, email, password, role = 'user', adminInviteCode } = req.body;
    if (!name?.trim() || !email?.trim() || !password) {
        return res.status(400).json({ message: 'Name, email, and password are required.' });
    }
    if (!['user', 'admin'].includes(role)) {
        return res.status(400).json({ message: 'Choose a valid account type.' });
    }
    if (role === 'admin') {
        const expectedCode = process.env.ADMIN_INVITE_CODE || '';
        const providedCode = typeof adminInviteCode === 'string' ? adminInviteCode : '';
        const expected = Buffer.from(expectedCode);
        const provided = Buffer.from(providedCode);
        const isValidCode = expected.length > 0
            && expected.length === provided.length
            && crypto.timingSafeEqual(expected, provided);
        if (!isValidCode) {
            return res.status(403).json({ message: 'A valid administrator invite code is required.' });
        }
    }
    if (password.length < 8) {
        return res.status(400).json({ message: 'Use a password with at least 8 characters.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (await User.exists({ email: normalizedEmail })) {
        return res.status(409).json({ message: 'An account with that email already exists.' });
    }

    try {
        const user = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            password,
            role,
        });
        setSessionCookie(res, user);
        return res.status(201).json({ success: true, user: publicUser(user) });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ message: 'An account with that email already exists.' });
        }
        throw error;
    }
};

exports.login = async (req, res) => {
    const { email, password, role = 'user' } = req.body;
    if (!email?.trim() || !password) {
        return res.status(400).json({ message: 'Enter your email and password.' });
    }
    if (!['user', 'admin'].includes(role)) {
        return res.status(400).json({ message: 'Choose a valid account type.' });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({ message: 'Email or password is incorrect.' });
    }
    if (user.role !== role) {
        return res.status(403).json({
            message: role === 'admin'
                ? 'This account does not have administrator access.'
                : 'This is an administrator account. Choose administrator sign in.',
        });
    }

    setSessionCookie(res, user);
    return res.status(200).json({ success: true, user: publicUser(user) });
};

exports.me = async (req, res) => {
    const token = req.cookies?.rur_token;
    if (!token) return res.status(200).json({ success: true, user: null });
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(payload.sub);
        return res.status(200).json({ success: true, user: user ? publicUser(user) : null });
    } catch {
        return res.status(200).json({ success: true, user: null });
    }
};

exports.logout = (req, res) => {
    res.clearCookie('rur_token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
    });
    return res.status(200).json({ success: true });
};
