const mongoose = require('mongoose');
const User = require('../models/user');

function safeUser(user) {
    return { id: user._id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt };
}

exports.createUser = async (req, res) => {
    const { name, email, password, role = 'user' } = req.body;
    if (!name?.trim() || !email?.trim() || !password || password.length < 8) {
        return res.status(400).json({ message: 'Name, email, and a password of at least 8 characters are required.' });
    }
    if (!['user', 'admin'].includes(role)) {
        return res.status(400).json({ message: 'Choose a valid user role.' });
    }
    try {
        const user = await User.create({ name: name.trim(), email: email.trim().toLowerCase(), password, role });
        return res.status(201).json({ success: true, user: safeUser(user) });
    } catch (error) {
        if (error.code === 11000) return res.status(409).json({ message: 'That email is already in use.' });
        throw error;
    }
};

exports.listUsers = async (req, res) => {
    const users = await User.find().sort({ createdAt: -1 }).lean();
    res.status(200).json({ success: true, users: users.map(safeUser) });
};

exports.updateUser = async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).json({ message: 'Invalid user ID.' });
    }
    const { name, email, role } = req.body;
    const updates = {};
    if (typeof name === 'string') updates.name = name.trim();
    if (typeof email === 'string') updates.email = email.trim().toLowerCase();
    if (['user', 'admin'].includes(role)) updates.role = role;
    if (!Object.keys(updates).length) {
        return res.status(400).json({ message: 'Provide a name, email, or valid role to update.' });
    }

    try {
        const current = await User.findById(req.params.id);
        if (!current) return res.status(404).json({ message: 'User not found.' });
        if (req.params.id === req.user.id && updates.role && updates.role !== 'admin') {
            return res.status(400).json({ message: 'You cannot remove administrator access from your signed-in account.' });
        }
        if (current.role === 'admin' && updates.role === 'user' && await User.countDocuments({ role: 'admin' }) <= 1) {
            return res.status(400).json({ message: 'The last administrator account cannot be demoted.' });
        }
        const user = await User.findByIdAndUpdate(req.params.id, updates, { returnDocument: 'after', runValidators: true });
        if (!user) return res.status(404).json({ message: 'User not found.' });
        return res.status(200).json({ success: true, user: safeUser(user) });
    } catch (error) {
        if (error.code === 11000) return res.status(409).json({ message: 'That email is already in use.' });
        throw error;
    }
};

exports.deleteUser = async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).json({ message: 'Invalid user ID.' });
    }
    if (req.params.id === req.user.id) {
        return res.status(400).json({ message: 'You cannot delete your own signed-in admin account.' });
    }
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    if (user.role === 'admin' && await User.countDocuments({ role: 'admin' }) <= 1) {
        return res.status(400).json({ message: 'The last administrator account cannot be deleted.' });
    }
    await user.deleteOne();
    return res.status(200).json({ success: true, id: user.id });
};
