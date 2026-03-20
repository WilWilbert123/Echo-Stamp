// models/Chat.js
const mongoose = require('mongoose');

const ChatSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    messages: [
        {
            role: { type: String, enum: ['user', 'model'], required: true },
            parts: [{ text: String }],
            createdAt: { type: Date, default: Date.now }
        }
    ]
}, { timestamps: true });

module.exports = mongoose.model('Chat', ChatSchema);