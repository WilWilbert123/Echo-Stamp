const Message = require('../models/messageModel');

 
exports.sendMessage = async (req, res) => {
    try {
        const { receiverId, content } = req.body;
        const senderId = req.user.id; 

        const newMessage = await Message.create({
            sender: senderId,
            receiver: receiverId,
            content
        });

        res.status(201).json(newMessage);
    } catch (error) {
        res.status(500).json({ message: 'Server Error: Could not send message' });
    }
};

// @desc    Get conversation between two users
// @route   GET /api/messages/:userId
exports.getMessages = async (req, res) => {
    try {
        const otherUserId = req.params.userId;
        const myId = req.user.id;

        const messages = await Message.find({
            $or: [
                { sender: myId, receiver: otherUserId },
                { sender: otherUserId, receiver: myId }
            ]
        }).sort({ createdAt: 1 }); // Oldest first for chat flow

        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ message: 'Server Error: Could not fetch messages' });
    }
};