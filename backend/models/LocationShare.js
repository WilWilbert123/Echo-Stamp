const mongoose = require('mongoose');

const locationShareSchema = new mongoose.Schema({
    sharer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    recipients: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    isActive: { type: Boolean, default: true },
    expiresAt: { type: Date, required: true }
}, { timestamps: true });

// Index to automatically cleanup expired shares
locationShareSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('LocationShare', locationShareSchema);