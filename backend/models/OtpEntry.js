const mongoose = require('mongoose');

const otpEntrySchema = new mongoose.Schema({
    email: { 
        type: String, 
        required: true, 
        lowercase: true, 
        trim: true 
    },
    otp: { 
        type: String, 
        required: true 
    },
    userData: { 
        type: Object, 
        required: false  
    },
    createdAt: { 
        type: Date, 
        default: Date.now, 
        index: { expires: 600 }  
    }
}, { timestamps: true });  

module.exports = mongoose.model('OtpEntry', otpEntrySchema);