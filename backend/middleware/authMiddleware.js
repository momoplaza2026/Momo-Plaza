const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            req.user = await User.findById(decoded.id).select('-password');
            if (req.user) {
                next();
            } else {
                res.status(401).json({ message: 'Not authorized, user not found' });
            }
        } catch (error) {
            console.error('Auth check error:', error);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    } else {
        res.status(401).json({ message: 'Not authorized, no token available' });
    }
};

const admin = (req, res, next) => {
    if (req.user && req.user.isAdmin) {
        next();
    } else {
        res.status(401).json({ message: 'Not authorized as an admin' });
    }
};

const driver = (req, res, next) => {
    if (req.user && req.user.isDriver) {
        next();
    } else {
        res.status(401).json({ message: 'Not authorized as a driver' });
    }
};

module.exports = { protect, admin, driver };
