const User = require('../models/User');
const OtpEntry = require('../models/OtpEntry');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, 
    },
});

// --- REGISTER: Step 1 (Request OTP) ---
exports.requestOtp = async (req, res) => {
    try {
        const { firstName, lastName, username, password } = req.body;
        const email = req.body.email ? req.body.email.toLowerCase().trim() : "";

        if (!firstName || !lastName || !username || !email || !password) {
            return res.status(400).json({ message: 'Please add all fields' });
        }

        const userExists = await User.findOne({ $or: [{ email }, { username }] });
        
        if (userExists) {
            const conflictField = userExists.email === email ? 'Email' : 'Username';
            return res.status(400).json({ 
                message: `${conflictField} is already registered. Please use another one.` 
            });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        await OtpEntry.findOneAndUpdate(
            { email },
            { 
                otp, 
                userData: { firstName, lastName, username, email, password },
                createdAt: new Date() 
            },
            { upsert: true, returnDocument: 'after' }
        );

        await transporter.sendMail({
            from: `"Echo Stamp" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Verify Your Account',
            html: `<h1>Welcome!</h1><p>Your verification code is: <b>${otp}</b></p><p>Expires in 10 minutes.</p>`,
        });

        return res.status(200).json({ message: 'OTP sent to email' });
    } catch (error) {
        console.error("OTP REQUEST ERROR:", error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// --- REGISTER: Step 2 (Verify & Create User) ---
exports.verifyOtpAndRegister = async (req, res) => {
    try {
        const email = req.body.email ? req.body.email.toLowerCase().trim() : "";
        const otp = req.body.otp ? req.body.otp.trim() : "";

        if (!email || !otp) {
            return res.status(400).json({ message: 'Email and OTP are required' });
        }

        const entry = await OtpEntry.findOne({ email, otp });

        if (!entry) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        // Check if this OTP actually contains user data (Registration) 
        // or if it was a Forgot Password OTP (which has no userData)
        if (!entry.userData) {
            return res.status(400).json({ message: 'This code is for password reset. Please use the reset screen.' });
        }

        const { firstName, lastName, username, password } = entry.userData;

        const user = await User.create({
            firstName,
            lastName,
            username,
            email,
            password 
        });

        await OtpEntry.deleteOne({ _id: entry._id });

        return res.status(201).json({
            token: generateToken(user._id),
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                username: user.username,
                email: user.email
            }
        });

    } catch (error) {
        console.error("Registration Error:", error);
        return res.status(500).json({ message: 'Server error during verification', error: error.message });
    }
};

// --- FORGOT PASSWORD: Step 1 (Request Reset Code) ---
exports.forgotPasswordRequest = async (req, res) => {
    try {
        const email = req.body.email ? req.body.email.toLowerCase().trim() : "";
        if (!email) return res.status(400).json({ message: "Email is required" });

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "No account found with this email" });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Save OTP and explicitly set userData to null for security
        await OtpEntry.findOneAndUpdate(
            { email },
            { 
                otp, 
                userData: null, 
                createdAt: new Date() 
            },
            { upsert: true, returnDocument: 'after' }
        );

        await transporter.sendMail({
            from: `"Echo Stamp" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Password Reset Code',
            html: `<h1>Reset Your Password</h1><p>Your code is: <b>${otp}</b></p>`,
        });

        return res.status(200).json({ message: 'Reset code sent' });
    } catch (error) {
        console.error("FORGOT PASSWORD ERROR:", error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// --- FORGOT PASSWORD: Step 2 (Save New Password) ---
exports.resetPassword = async (req, res) => {
    try {
        const { otp, newPassword } = req.body;
        const email = req.body.email ? req.body.email.toLowerCase().trim() : "";

        if (!otp || !newPassword || !email) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const entry = await OtpEntry.findOne({ email, otp });
        if (!entry) {
            return res.status(400).json({ message: 'Invalid or expired code' });
        }

        const user = await User.findOne({ email });
        if(!user) return res.status(404).json({ message: "User not found" });

        // Update password (pre-save hook in model handles hashing)
        user.password = newPassword;  
        await user.save();

        await OtpEntry.deleteOne({ _id: entry._id });

        return res.status(200).json({ message: 'Password reset successful' });
    } catch (error) {
        console.error("RESET PASSWORD ERROR:", error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// --- LOGIN ---
exports.loginUser = async (req, res) => {
    try {
        const email = req.body.email ? req.body.email.toLowerCase().trim() : "";
        const { password } = req.body;
        
        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            return res.json({
                token: generateToken(user._id),
                user: { 
                    id: user._id, 
                    firstName: user.firstName,  
                    lastName: user.lastName,    
                    username: user.username, 
                    email: user.email 
                }
            });
        } else {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error("LOGIN ERROR:", error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};