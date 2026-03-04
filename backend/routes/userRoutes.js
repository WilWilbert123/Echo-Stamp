const express = require('express');
const router = express.Router();
const { 
    requestOtp, 
    verifyOtpAndRegister, 
    loginUser,
    forgotPasswordRequest,
    resetPassword 
} = require('../controllers/userController');

// --- Registration Flow ---

 
router.post('/request-otp', requestOtp); 
router.post('/verify-otp', verifyOtpAndRegister);

// --- Forgot Password Flow ---
router.post('/forgot-password', forgotPasswordRequest); 
router.post('/reset-password', resetPassword);

// --- Authentication ---
router.post('/login', loginUser);

module.exports = router;