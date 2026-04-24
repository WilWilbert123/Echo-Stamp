// models/Group.js - Add reactions field to message schema
const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    messages: [{
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        senderName: String,
        content: {
            type: String,
            trim: true
        },
        seenBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        voiceUrl: { type: String },
        media: [{
            url: { type: String },
            mediaType: { type: String, enum: ['image', 'video'] }
        }],
        duration: { type: Number },
        isEdited: { type: Boolean, default: false },
        reactions: [{
            userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
            emoji: { type: String, required: true },
            createdAt: { type: Date, default: Date.now }
        }],
        createdAt: { type: Date, default: Date.now }
    }]
}, { timestamps: true });

module.exports = mongoose.model('Group', groupSchema);