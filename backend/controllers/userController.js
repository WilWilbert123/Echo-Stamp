const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @desc    Register new user
// @route   POST /api/users/register
exports.registerUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Basic validation
        if (!username || !email || !password) {
            return res.status(400).json({ message: 'Please add all fields' });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({ username, email, password });

        if (user) {
            // Check if token generation works
            const token = generateToken(user._id);
            
            res.status(201).json({
                token: token,
                user: { id: user._id, username: user.username, email: user.email }
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        console.error("REGISTRATION ERROR:", error); // Check your terminal for this!
        res.status(500).json({ 
            message: 'Server error during registration', 
            error: error.message 
        });
    }
};

// @desc    Authenticate user
// @route   POST /api/users/login
exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        res.json({
            token: generateToken(user._id),
            user: { id: user._id, username: user.username, email: user.email }
        });
    } else {
        res.status(401).json({ error: 'Invalid email or password' });
    }
};