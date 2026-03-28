const Message = require('../models/messageModel');

exports.sendMessage = async (req, res) => {
    try {
        const { receiverId, content } = req.body;
        const senderId = req.user._id; // Using _id for consistency with other controllers

        if (!receiverId || !content) {
            return res.status(400).json({ message: 'Receiver ID and content are required' });
        }

        // Find conversation or create one, then push the new message into the array
        const conversation = await Message.findOneAndUpdate(
            { participants: { $all: [senderId, receiverId] } },
            { 
                $push: { messages: { sender: senderId, content } },
                $setOnInsert: { participants: [senderId, receiverId] }
            },
            { new: true, upsert: true }
        );

        if (!conversation || !conversation.messages) {
            return res.status(500).json({ message: 'Failed to update conversation' });
        }

        const newMessage = conversation.messages[conversation.messages.length - 1];
        res.status(201).json(newMessage);
    } catch (error) {
        console.error("SEND_MESSAGE_ERROR:", error);
        res.status(500).json({ message: 'Server Error: Could not send message', error: error.message });
    }
};

// @desc    Get conversation between two users
// @route   GET /api/messages/:userId
exports.getMessages = async (req, res) => {
    try {
        const otherUserId = req.params.userId;
        const myId = req.user._id;

        const conversation = await Message.findOne({
            participants: { $all: [myId, otherUserId] }
        });

        res.status(200).json(conversation ? conversation.messages : []);
    } catch (error) {
        console.error("GET_MESSAGES_ERROR:", error);
        res.status(500).json({ message: 'Server Error: Could not fetch messages', error: error.message });
    }
};

exports.getConversations = async (req, res) => {
    try {
        const myId = req.user._id;
        
        // Find all conversation documents where I am a participant
        const conversations = await Message.find({ participants: myId })
            .populate('participants', 'firstName lastName username');

        // Extract the "other" user profile from each conversation
        const chatPartners = conversations.map(conv => 
            conv.participants.find(p => p._id.toString() !== myId.toString())
        ).filter(Boolean);

        res.status(200).json(chatPartners);
    } catch (error) {
        res.status(500).json({ message: 'Server Error: Could not fetch conversation list' });
    }
};