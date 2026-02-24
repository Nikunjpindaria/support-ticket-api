const express = require('express');
const User = require('../models/User');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const { validateCreateUser } = require('../middleware/validate');
const router = express.Router();

// @route   POST /users
// @desc    Create a new user (only managers can do this)
router.post('/', authenticate, authorize('MANAGER'), validateCreateUser, async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // check if user already exists
        let user = await User.findOne({ email: email.toLowerCase() });
        if (user) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        // create new user (password gets hashed in pre-save hook)
        user = new User({
            name,
            email: email.toLowerCase(),
            password,
            role
        });

        await user.save();

        // return user without password
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /users
// @desc    Get all users (manager only)
router.get('/', authenticate, authorize('MANAGER'), async (req, res) => {
    try {
        const users = await User.find().sort({ createdAt: 1 });
        res.json(users);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
