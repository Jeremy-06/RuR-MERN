const User = require('../models/user')
const jwt = require("jsonwebtoken")

exports.isAuthenticatedUser = async (req, res, next) => {
    const { token } = req.cookies

    if (!token) {
        return res.status(401).json({ message: 'Login first to access this resource' })
    }

    let decoded
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET)
    } catch (error) {
        return res.status(401).json({ message: 'Session expired, please login again' })
    }

    req.user = await User.findById(decoded.id);
    if (!req.user) {
        return res.status(401).json({ message: 'Login first to access this resource' })
    }

    next()
};

exports.authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: `Role (${req.user.role}) is not allowed to acccess this resource` })
        }
        next()
    }
}
