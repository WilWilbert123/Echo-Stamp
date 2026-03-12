const User = require('../models/User');
const OtpEntry = require('../models/OtpEntry');
const jwt = require('jsonwebtoken');
const Resend = require('resend');

// Initialize Resend with your API key
const resend = new Resend(process.env.RESEND_API_KEY);

// Helper: Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// Helper: Send email via Resend
const sendEmail = async ({ to, subject, html }) => {
    try {
        const response = await resend.emails.send({
            from: "Echo Stamp <onboarding@resend.dev>", // Onboarding sender
            to,
            subject,
            html,
        });
        console.log("Email sent:", response.id);
        return response;
    } catch (error) {
        console.error("Email send failed:", error);
        throw error;
    }
};

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
                message: `${conflictField} is already registered.` 
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
            { upsert: true, new: true }
        );

        // Send OTP email using Resend API
        await sendEmail({
            to: email,
            subject: 'Verify Your Account',
            html: `
                <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                    <h2 style="color: #3b82f6;">Welcome to Echo Stamp!</h2>
                    <p>Your verification code is:</p>
                    <div style="background: #f3f4f6; padding: 15px; font-size: 24px; font-weight: bold; text-align: center; letter-spacing: 5px; color: #1e293b;">
                        ${otp}
                    </div>
                    <p style="margin-top: 20px; color: #64748b; font-size: 12px;">This code expires in 10 minutes.</p>
                </div>
            `,
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
        if (!entry) return res.status(400).json({ message: 'Invalid or expired OTP' });
        if (!entry.userData) return res.status(400).json({ message: 'Invalid request context' });

        const { firstName, lastName, username, password } = entry.userData;

        const user = await User.create({ firstName, lastName, username, email, password });
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

// --- FORGOT PASSWORD: Step 1 (Request Reset) ---
exports.forgotPasswordRequest = async (req, res) => {
    try {
        const email = req.body.email ? req.body.email.toLowerCase().trim() : "";
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "No account found" });

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        await OtpEntry.findOneAndUpdate(
            { email },
            { otp, userData: null, createdAt: new Date() },
            { upsert: true }
        );

        await sendEmail({
            to: email,
            subject: 'Password Reset Code',
            html: `<p>Your password reset code is: <b>${otp}</b></p>`,
        });

        return res.status(200).json({ message: 'Reset code sent' });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// --- FORGOT PASSWORD: Step 2 (Save New Password) ---
exports.resetPassword = async (req, res) => {
    try {
        const { otp, newPassword } = req.body;
        const email = req.body.email ? req.body.email.toLowerCase().trim() : "";

        const entry = await OtpEntry.findOne({ email, otp });
        if (!entry) return res.status(400).json({ message: 'Invalid code' });

        const user = await User.findOne({ email });
        if(!user) return res.status(404).json({ message: "User not found" });

        user.password = newPassword;  
        await user.save();
        await OtpEntry.deleteOne({ _id: entry._id });

        return res.status(200).json({ message: 'Password reset successful' });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// --- VERIFY ONLY ---
exports.verifyOnly = async (req, res) => {
    try {
        const email = req.body.email ? req.body.email.toLowerCase().trim() : "";
        const otp = req.body.otp ? req.body.otp.trim() : "";

        const entry = await OtpEntry.findOne({ email, otp });
        if (!entry) return res.status(400).json({ message: 'Invalid code' });

        return res.status(200).json({ message: 'OTP verified' });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};
