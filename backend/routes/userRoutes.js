const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { 
    requestOtp, 
    verifyOtpAndRegister, 
    loginUser,
    forgotPasswordRequest,
    resetPassword,
    verifyOnly,
    updateSecurity,
    verify2faLogin,
    deleteFullAccount,
    updatePrivacy,
    getAllUsers,
    updateProfile
} = require('../controllers/userController');

// --- Registration Flow ---

 
router.post('/request-otp', requestOtp); 
router.post('/verify-otp', verifyOtpAndRegister);

// --- Forgot Password Flow ---
router.post('/forgot-password', forgotPasswordRequest); 
router.post('/reset-password', resetPassword);
router.post('/verify-only', verifyOnly);

// --- Two Factor Auth----
router.post('/update-security', protect, updateSecurity);
router.post('/login-2fa-verify', verify2faLogin);

// -----Delete account -----
router.delete('/full-delete', protect, deleteFullAccount);

//-------Profile Visibility
router.patch('/update-privacy', protect, updatePrivacy);

//-------Profile Edit
router.patch('/update-profile', protect, updateProfile);

//get all user
router.get('/all', protect, getAllUsers);


// --- Authentication ---
router.post('/login', loginUser);

module.exports = router;