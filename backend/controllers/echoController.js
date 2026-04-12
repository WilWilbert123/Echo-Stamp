const Echo = require('../models/Echo');
const User = require('../models/User'); // Ensure User model is available for population
const Notification = require('../models/Notification');
const axios = require('axios');

// --- PUSH NOTIFICATION HELPER ---
const sendPushNotification = async (recipientId, title, body, data) => {
    try {
        const user = await User.findById(recipientId);
        if (!user || !user.pushToken || !user.notificationsEnabled) return;

        const message = {
            to: user.pushToken,
            sound: 'default',
            title: title,
            body: body,
            data: data,
            priority: 'high',
        };

        await axios.post('https://exp.host/--/api/v2/push/send', message, {
            headers: {
                'Accept': 'application/json',
                'Accept-encoding': 'gzip, deflate',
                'Content-Type': 'application/json',
            },
        });
    } catch (error) {
        console.error("Push Notification Error:", error.message);
    }
};

// @desc    Get all echoes from all users (Global Feed)
// @route   GET /api/echoes/global
exports.getGlobalEchoes = async (req, res) => {
    try {
        const echoes = await Echo.find()
            .populate('userId', 'username firstName lastName profilePicture')
            .sort({ createdAt: -1 });

        console.log(`[GET] Global Feed: Found ${echoes.length} items`);
        res.status(200).json(echoes);
    } catch (error) {
        console.error("GlobalEchoes Error:", error.message);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get memories based on user and type
// @route   GET /api/echoes/:userId/:type
exports.getEchoes = async (req, res) => {
    try {
        const { userId, type } = req.params;

        // Validation to ensure we don't query with undefined values
        if (!userId || !type) {
            return res.status(400).json({ message: "UserId and Type are required" });
        }

        // We find by userId and type (which should be 'mode')
        const echoes = await Echo.find({ 
            userId: userId, 
            type: type 
        })
        .populate('userId', 'username firstName lastName profilePicture')
        .sort({ createdAt: -1 });

        console.log(`[GET] Found ${echoes.length} items for User: ${userId} Type: ${type}`);
        
        res.status(200).json(echoes);
    } catch (error) {
        console.error("GetEchoes Error:", error.message);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a new memory (Text only)
// @route   POST /api/echoes
exports.createEcho = async (req, res) => {
    try {
        // Ensure type is 'mode' if it's missing from the body
        const echoData = {
            ...req.body,
            type: req.body.type || 'mood'
        };

        let newEcho = await Echo.create(echoData);
        // Populate user details so the feed shows the correct info immediately after creation
        newEcho = await Echo.findById(newEcho._id).populate('userId', 'username firstName lastName profilePicture');
        
        console.log(`[POST] New Echo created with ID: ${newEcho._id}`);
        res.status(201).json(newEcho);
    } catch (error) {
        console.error("CreateEcho Error:", error.message);
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete a memory
// @route   DELETE /api/echoes/:id
exports.deleteEcho = async (req, res) => {
    try {
        const deletedEcho = await Echo.findByIdAndDelete(req.params.id);
        
        if (!deletedEcho) {
            return res.status(404).json({ message: "Echo not found" });
        }

        console.log(`[DELETE] Echo deleted: ${req.params.id}`);
        res.status(200).json({ message: "Deleted successfully", id: req.params.id });
    } catch (error) {
        console.error("DeleteEcho Error:", error.message);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Like/Unlike an echo
// @route   POST /api/echoes/:id/like
exports.likeEcho = async (req, res) => {
    try {
        const echo = await Echo.findById(req.params.id);
        if (!echo) return res.status(404).json({ message: "Echo not found" });

        const index = echo.likes.indexOf(req.body.userId);
        if (index === -1) {
            echo.likes.push(req.body.userId);
            
            // Notify Author
            if (echo.userId.toString() !== req.body.userId.toString()) {
                await Notification.create({
                    recipient: echo.userId,
                    sender: req.body.userId,
                    type: 'like',
                    echoId: echo._id,
                    content: 'liked your echo'
                });
                const sender = await User.findById(req.body.userId);
                await sendPushNotification(
                    echo.userId, 
                    "Echo Stamp", 
                    `${sender.firstName} liked your echo`, 
                    { type: 'like', echoId: echo._id }
                );
            }
        } else {
            echo.likes.splice(index, 1);
        }

        await echo.save();
        const updated = await Echo.findById(echo._id)
            .populate('userId', 'username firstName lastName profilePicture');
        res.status(200).json(updated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Comment on an echo
// @route   POST /api/echoes/:id/comment
exports.commentEcho = async (req, res) => {
    try {
        const { userId, username, profilePicture, text } = req.body;
        const echo = await Echo.findById(req.params.id);
        if (!echo) return res.status(404).json({ message: "Echo not found" });

        echo.comments.push({ userId, username, profilePicture, text });
        await echo.save();
        
        const newComment = echo.comments[echo.comments.length - 1];

        // Notify Author
        if (echo.userId.toString() !== userId.toString()) {
            await Notification.create({
                recipient: echo.userId,
                sender: userId,
                type: 'comment',
                echoId: echo._id,
                commentId: newComment._id,
                content: 'commented on your echo'
            });
            await sendPushNotification(echo.userId, "New Comment", `${username} commented on your echo`, { 
                type: 'comment', 
                echoId: echo._id,
                commentId: newComment._id,
                focusComment: true
            });
        }

        const updated = await Echo.findById(echo._id)
            .populate('userId', 'username firstName lastName profilePicture');
        res.status(200).json(updated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Reply to a comment
// @route   POST /api/echoes/:id/comment/:commentId/reply
exports.replyToComment = async (req, res) => {
    try {
        const { userId, username, profilePicture, text } = req.body;
        const echo = await Echo.findById(req.params.id);
        if (!echo) return res.status(404).json({ message: "Echo not found" });

        const comment = echo.comments.id(req.params.commentId);
        if (!comment) return res.status(404).json({ message: "Comment not found" });

        comment.replies.push({ userId, username, profilePicture, text });
        await echo.save();

        // Notify Commenter
        if (comment.userId.toString() !== userId.toString()) {
            await Notification.create({
                recipient: comment.userId,
                sender: userId,
                type: 'comment',
                echoId: echo._id,
                commentId: comment._id,
                content: 'replied to your comment'
            });
            await sendPushNotification(comment.userId, "New Reply", `${username} replied to your reflection`, { 
                type: 'comment', 
                echoId: echo._id,
                commentId: comment._id,
                focusComment: true
            });
        }

        const updated = await Echo.findById(echo._id)
            .populate('userId', 'username firstName lastName profilePicture');
        res.status(200).json(updated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a comment
// @route   DELETE /api/echoes/:id/comment/:commentId
exports.deleteComment = async (req, res) => {
    try {
        const echo = await Echo.findById(req.params.id);
        if (!echo) return res.status(404).json({ message: "Echo not found" });

        echo.comments.pull({ _id: req.params.commentId });
        await echo.save();
        res.status(200).json(echo);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};