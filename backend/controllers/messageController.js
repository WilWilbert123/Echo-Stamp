const Message = require('../models/messageModel');
const User = require('../models/User');
const axios = require('axios');

const sendPushNotification = async (expoPushToken, title, body, data) => {
    const message = {
        to: expoPushToken,
        sound: 'default',
        title: title,
        body: body,
        data: data,
    };

    try {
        const response = await axios.post('https://exp.host/--/api/v2/push/send', message, {
            headers: {
                'Accept': 'application/json',
                'Accept-encoding': 'gzip, deflate',
                'Content-Type': 'application/json',
            },
        });

        // Expo returns an array of receipts in the 'data' field
        const tickets = response.data.data;
        
        // If we sent one message, we check the first ticket
        const ticket = Array.isArray(tickets) ? tickets[0] : response.data;
        
        if (ticket.status === 'error') {
            console.error("[Push Notification] Expo Error:", ticket.message);
        } else {
            console.log("[Push Notification] Sent to Expo successfully. ID:", ticket.id || 'N/A');
        }

    } catch (error) {
        console.error("Error sending push notification:", error.response?.data || error.message);
    }
};

exports.sendMessage = async (req, res) => {
    try {
        const { receiverId, content } = req.body;
        const senderId = req.user._id;
        const senderName = req.user.firstName || "Someone";

        if (!receiverId || !content) {
            return res.status(400).json({ message: 'Receiver ID and content are required' });
        }

        // Attempt to update the existing conversation first
        let conversation = await Message.findOneAndUpdate(
            { participants: { $all: [senderId, receiverId] } },
            { $push: { messages: { sender: senderId, content } } },
            { new: true }
        );

        // If no conversation exists, create a new one
        if (!conversation) {
            conversation = await Message.create({
                participants: [senderId, receiverId],
                messages: [{ sender: senderId, content }]
            });
        }

        if (!conversation || !conversation.messages) {
            return res.status(500).json({ message: 'Failed to update conversation' });
        }

        const newMessage = conversation.messages[conversation.messages.length - 1];

        // Push Notification Logic
        const receiver = await User.findById(receiverId);
        if (receiver && receiver.pushToken && receiver.notificationsEnabled) {
            sendPushNotification(
                receiver.pushToken,
                `New message from ${senderName}`,
                content,
                { senderId: senderId }
            );
        } else if (receiver) {
            console.log(`[Push Notification] Skipped for user ${receiverId}: Token exists: ${!!receiver.pushToken}, Enabled: ${receiver.notificationsEnabled}`);
        }

        res.status(201).json(newMessage);
    } catch (error) {
        console.error("SEND_MESSAGE_ERROR:", error);
        res.status(500).json({ message: 'Server Error: Could not send message', error: error.message });
    }
};

 
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
        
        // Find conversations and sort by updatedAt (latest activity)
        const conversations = await Message.find({ participants: myId })
            .populate('participants', 'firstName lastName username')
            .sort({ updatedAt: -1 });

        const conversationList = conversations.map(conv => {
            const otherUser = conv.participants.find(p => p._id.toString() !== myId.toString());
            if (!otherUser) return null;

            const lastMsg = conv.messages[conv.messages.length - 1];
            const unreadCount = conv.messages.filter(m => 
                m.sender.toString() !== myId.toString() && !m.isRead
            ).length;

            return {
                _id: otherUser._id, // Used for navigation/ID
                user: otherUser,
                lastMessage: lastMsg ? lastMsg.content : "No messages yet",
                lastMessageTime: lastMsg ? lastMsg.createdAt : conv.updatedAt,
                unreadCount
            };
        }).filter(Boolean);

        res.status(200).json(conversationList);
    } catch (error) {
        console.error("GET_CONVERSATIONS_ERROR:", error);
        res.status(500).json({ message: 'Server Error: Could not fetch conversation list', error: error.message });
    }
};

exports.markAsRead = async (req, res) => {
    try {
        const myId = req.user._id;
        const { otherUserId } = req.params;

        await Message.updateOne(
            { participants: { $all: [myId, otherUserId] } },
            { $set: { "messages.$[msg].isRead": true } },
            { arrayFilters: [{ "msg.sender": otherUserId, "msg.isRead": false }], multi: true }
        );

        res.status(200).json({ message: "Messages marked as read" });
    } catch (error) {
        res.status(500).json({ message: 'Error marking messages as read' });
    }
};

exports.editMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const { content } = req.body;
        const myId = req.user._id;

        const conversation = await Message.findOneAndUpdate(
            { 
                "messages._id": messageId, 
                "messages.sender": myId 
            },
            { 
                $set: { 
                    "messages.$.content": content,
                    "messages.$.isEdited": true 
                } 
            },
            { new: true }
        );

        if (!conversation) return res.status(404).json({ message: "Message not found or unauthorized" });
        
        const updatedMessage = conversation.messages.id(messageId);
        res.status(200).json(updatedMessage);
    } catch (error) {
        res.status(500).json({ message: 'Error editing message' });
    }
};

exports.deleteMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const myId = req.user._id;

        const conversation = await Message.findOneAndUpdate(
            { "messages._id": messageId, "messages.sender": myId },
            { $pull: { messages: { _id: messageId } } },
            { new: true }
        );

        if (!conversation) return res.status(404).json({ message: "Message not found or unauthorized" });
        res.status(200).json({ message: "Deleted", messageId });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting message' });
    }
};

exports.deleteConversation = async (req, res) => {
    try {
        const { otherUserId } = req.params;
        const myId = req.user._id;

        const conversation = await Message.findOneAndDelete({
            participants: { $all: [myId, otherUserId] }
        });

        if (!conversation) return res.status(404).json({ message: "Conversation not found" });
        res.status(200).json({ message: "Conversation deleted", otherUserId });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting conversation' });
    }
};