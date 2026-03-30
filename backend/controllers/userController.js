const User = require('../models/User');
const OtpEntry = require('../models/OtpEntry');
const jwt = require('jsonwebtoken');
const { Resend } = require('resend');
const Journal = require('../models/Journal');
const cloudinary = require('cloudinary').v2;
const Echo = require('../models/Echo');


// Initialize Resend with your API key
const resend = new Resend(process.env.RESEND_API_KEY);

// Helper: Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// Helper: Send email via Resend
const sendEmail = async ({ to, subject, html }) => {
    try {
        const { data, error } = await resend.emails.send({
            
            from: "Echo Stamp <verification@echostamp.online>", 
            to,
            subject,
            html,
        });

        if (error) {
            console.error("Resend API Error:", error);
            throw new Error(error.message);
        }

        
        console.log("Email sent successfully! ID:", data.id);
        return data;
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
                email: user.email,
                profilePicture: user.profilePicture,
                isPublic: user.isPublic ?? false
            }
        });
    } catch (error) {
        console.error("Registration Error:", error);
        return res.status(500).json({ message: 'Server error during verification', error: error.message });
    }
};

// --- LOGIN (Modified for 2FA) ---
exports.loginUser = async (req, res) => {
    try {
        const email = req.body.email ? req.body.email.toLowerCase().trim() : "";
        const { password } = req.body;
        
        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            if (user.twoFactorEnabled) {
                const otp = Math.floor(100000 + Math.random() * 900000).toString();
                
                await OtpEntry.findOneAndUpdate(
                    { email },
                    { otp, userData: null, createdAt: new Date() },
                    { upsert: true }
                );

                await sendEmail({
                    to: email,
                    subject: 'Login Verification Code',
                    html: `<p>Your secure login code is: <b>${otp}</b></p>`,
                });

                return res.status(200).json({ 
                    twoFactorRequired: true, 
                    email: user.email 
                });
            }

            return res.json({
                token: generateToken(user._id),
                user: { 
                    id: user._id, 
                    firstName: user.firstName,  
                    lastName: user.lastName,    
                    username: user.username, 
                    email: user.email,
                    profilePicture: user.profilePicture,
                    isPublic: user.isPublic ?? false
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

// --- SECURED: UPDATE SECURITY (Toggle 2FA) ---
exports.updateSecurity = async (req, res) => {
    try {
        const { twoFactorEnabled } = req.body;

        
        // This ensures a user can only toggle 2FA for THEIR own account.
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { twoFactorEnabled },
            { new: true }
        );

        if (!user) return res.status(404).json({ message: "User not found" });

        return res.status(200).json({ 
            message: "Security settings updated", 
            twoFactorEnabled: user.twoFactorEnabled 
        });
    } catch (error) {
        console.error("UPDATE SECURITY ERROR:", error);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};

// --- VERIFY 2FA LOGIN ---
exports.verify2faLogin = async (req, res) => {
    try {
        const email = req.body.email ? req.body.email.toLowerCase().trim() : "";
        const otp = req.body.otp ? req.body.otp.trim() : "";

        const entry = await OtpEntry.findOne({ email, otp });
        if (!entry) return res.status(400).json({ message: 'Invalid or expired code' });

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not found' });

        await OtpEntry.deleteOne({ _id: entry._id });

        return res.status(200).json({
            token: generateToken(user._id),
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                username: user.username,
                email: user.email,
                profilePicture: user.profilePicture,
                isPublic: user.isPublic ?? false
            }
        });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

 
// Delete Account with data
const deleteFromCloudinary = async (url) => {
  if (!url) return;
  try {
    const parts = url.split('/');
    const uploadIndex = parts.indexOf('upload');
    const publicId = parts.slice(uploadIndex + 2).join('/').split('.')[0];
    const isVideo = url.includes('/video/upload/');
    await cloudinary.uploader.destroy(publicId, { resource_type: isVideo ? 'video' : 'image' });
  } catch (err) {
    console.error("Cloudinary Cleanup Error:", err.message);
  }
};

// --- SECURED: DELETE FULL ACCOUNT ---
exports.deleteFullAccount = async (req, res) => {
  try {
   
    // This prevents someone from deleting a random user's account via ID guessing.
    const userId = req.user.id;

    // 1. Wipe Journals and their Cloudinary media
    const journals = await Journal.find({ userId });
    for (const journal of journals) {
      if (journal.media && journal.media.length > 0) {
        await Promise.all(journal.media.map(url => deleteFromCloudinary(url)));
      }
    }
    await Journal.deleteMany({ userId });

    // 2. Wipe Echoes and their Cloudinary media
    const echoes = await Echo.find({ userId });
    for (const echo of echoes) {
      if (echo.media && echo.media.length > 0) {
        await Promise.all(echo.media.map(url => deleteFromCloudinary(url)));
      }
    }
    await Echo.deleteMany({ userId });

    // 3. Delete the actual User
    const user = await User.findByIdAndDelete(userId);

    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ 
      success: true, 
      message: "Account, Journals, and Echoes wiped successfully." 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updatePrivacy = async (req, res) => {
    try {
        const { isPublic, notificationsEnabled, pushToken } = req.body;
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { isPublic, notificationsEnabled, pushToken },
            { new: true }
        ).select('-password');

        if (!user) return res.status(404).json({ message: "User not found" });

        return res.status(200).json({ 
            message: "Privacy updated", 
            isPublic: user.isPublic,
            user // Return the full user object to update Redux
        });
    } catch (error) {
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};

// --- FETCH ALL USERS (For Chat/Messages) ---
exports.getAllUsers = async (req, res) => {
    try {
     
        const users = await User.find({ _id: { $ne: req.user.id } })
            .select('firstName lastName username isPublic profilePicture');

        return res.status(200).json(users);
    } catch (error) {
        console.error("FETCH USERS ERROR:", error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { firstName, lastName, username, profilePicture } = req.body;
        const user = await User.findById(req.user.id);

        if (!user) return res.status(404).json({ message: "User not found" });

        if (username && username !== user.username) {
            const existing = await User.findOne({ username });
            if (existing) return res.status(400).json({ message: "Username already taken" });
            user.username = username;
        }

        if (firstName) user.firstName = firstName;
        if (lastName) user.lastName = lastName;

        if (profilePicture !== undefined) {
            if (user.profilePicture && user.profilePicture !== profilePicture) {
                await deleteFromCloudinary(user.profilePicture);
            }
            user.profilePicture = profilePicture;
        }

        await user.save();
        res.status(200).json({
            message: "Profile updated",
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                username: user.username,
                email: user.email,
                profilePicture: user.profilePicture,
                isPublic: user.isPublic
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
