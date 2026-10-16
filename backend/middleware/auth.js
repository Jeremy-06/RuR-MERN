const jwt = require('jsonwebtoken');
const User = require('../models/user');

async function requireAuth(req, res, next) {
    try {
        const token = req.cookies?.rur_token;
        if (!token) {
            return res.status(401).json({ message: 'Please sign in to continue.' });
        }

        const payload = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(payload.sub);
        if (!user) {
            return res.status(401).json({ message: 'This account is no longer available.' });
        }
        req.user = user;
        return next();
    } catch {
        return res.status(401).json({ message: 'Your session has expired. Please sign in again.' });
    }
}

function requireAdmin(req, res, next) {
    if (req.user?.role !== 'admin') {
        return res.status(403).json({ message: 'Administrator access is required.' });
    }
    return next();
}

module.exports = { requireAuth, requireAdmin };
