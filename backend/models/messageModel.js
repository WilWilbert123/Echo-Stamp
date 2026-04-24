// models/messageModel.js - Add reactions field to message schema
const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
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
        content: {
            type: String,
            trim: true
        },
        voiceUrl: { type: String },
        media: [{
            url: { type: String },
            mediaType: { type: String, enum: ['image', 'video'] }
        }],
        duration: { type: Number },
        isRead: { type: Boolean, default: false },
        isEdited: { type: Boolean, default: false },
        reactions: [{
            userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
            emoji: { type: String, required: true },
            createdAt: { type: Date, default: Date.now }
        }],
        createdAt: { type: Date, default: Date.now }
    }]
}, { timestamps: true });

module.exports = mongoose.model('Message', conversationSchema);