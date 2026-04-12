const Journal = require('../models/Journal');
const User = require('../models/User');  
const cloudinary = require('cloudinary').v2;
const mongoose = require('mongoose');
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
            android: { 
                channelId: 'default',
                priority: 'high'
            },
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

// --- HELPERS ---

const getPublicIdFromUrl = (url) => {
    try {
        const parts = url.split('/');
        const uploadIndex = parts.indexOf('upload');
        const pathAfterUpload = parts.slice(uploadIndex + 2).join('/'); 
        return pathAfterUpload.split('.')[0]; 
    } catch (error) {
        console.error("Error parsing Cloudinary URL:", error);
        return null;
    }
};

const deleteFromCloudinary = async (url) => {
    const publicId = getPublicIdFromUrl(url);
    if (!publicId) return;

    const isVideo = url.includes('/video/upload/');
    const resourceType = isVideo ? 'video' : 'image';

    try {
        const result = await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
        console.log(`[Cloudinary] Deleted: ${publicId}`, result);
    } catch (err) {
        console.error(`[Cloudinary] Failed to delete ${publicId}:`, err.message);
    }
};

// --- CONTROLLERS ---

exports.getGlobalJournals = async (req, res) => {
    try {
    
        const idFromQuery = req.query.userId;
        const idFromAuth = req.user?.id;
        const rawId = idFromQuery || idFromAuth;
 
        let currentUserId = null;
        if (rawId && rawId !== 'undefined' && mongoose.Types.ObjectId.isValid(rawId)) {
            currentUserId = new mongoose.Types.ObjectId(rawId);
        }

   
        const publicUsers = await User.find({ isPublic: true }).select('_id');
        const publicUserIds = publicUsers.map(user => user._id);

      
        let query = { userId: { $in: publicUserIds } };

        if (currentUserId) {
            query = {
                $or: [
                    { userId: currentUserId },
                    { userId: { $in: publicUserIds } }
                ]
            };
        }

        // 5. Execute and Populate
        const journals = await Journal.find(query)
            .populate('userId', 'username firstName lastName profilePicture')
            .populate('comments.userId', 'username profilePicture')
            .populate('comments.replies.userId', 'username profilePicture')
            .sort({ createdAt: -1 });

        console.log(`[Feed] Found ${journals.length} journals for User: ${currentUserId || 'Guest'}`);
        res.status(200).json(journals);
        
    } catch (error) {
        console.error("Global Feed Error:", error.message);
        res.status(500).json({ message: "Internal Server Error", details: error.message });
    }
};

// Get all journals for a specific user   
exports.getJournals = async (req, res) => {
    try {
        const { userId } = req.params;
        
        // Safety check for user ID parameter
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: "Invalid User ID format" });
        }

        const journals = await Journal.find({ userId })
            .populate('userId', 'username firstName lastName profilePicture')
            .populate('comments.userId', 'username profilePicture')
            .populate('comments.replies.userId', 'username profilePicture')
            .sort({ createdAt: -1 });
            
        res.status(200).json(journals);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create a new journal entry
exports.createJournal = async (req, res) => {
    try {
        // Ensure userId comes from the authenticated user
        const journalData = { ...req.body, userId: req.user.id };
        const newJournal = await Journal.create(journalData);
        
        // On a document instance, use an array to populate multiple paths at once
        await newJournal.populate([
            { path: 'userId', select: 'username firstName lastName profilePicture' },
            { path: 'comments.userId', select: 'username profilePicture' },
            { path: 'comments.replies.userId', select: 'username profilePicture' }
        ]);

        res.status(201).json(newJournal);
    } catch (error) {
        console.error("Journal Creation Error:", error.message);
        res.status(400).json({ message: error.message });
    }
};

// Delete a journal and its media
exports.deleteJournal = async (req, res) => {
    try {
        const { id } = req.params;
        const journal = await Journal.findById(id);
        if (!journal) return res.status(404).json({ message: "Journal not found" });

        if (journal.media && journal.media.length > 0) {
            await Promise.all(journal.media.map(url => deleteFromCloudinary(url)));
        }

        await Journal.findByIdAndDelete(id);
        res.status(200).json({ id });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Remove specific media from a journal
exports.removeJournalMedia = async (req, res) => {
    try {
        const { id } = req.params;
        const { mediaUri } = req.body;

        await deleteFromCloudinary(mediaUri);

        const journal = await Journal.findByIdAndUpdate(
            id,
            { $pull: { media: mediaUri } },
            { new: true }
        ).populate('userId', 'username firstName lastName profilePicture')
         .populate('comments.userId', 'username profilePicture')
         .populate('comments.replies.userId', 'username profilePicture');

        if (!journal) return res.status(404).json({ message: "Journal not found" });
        res.status(200).json(journal);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Toggle Like (1 user per react)
exports.toggleLike = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const journal = await Journal.findById(id);
        if (!journal) return res.status(404).json({ message: "Journal not found" });

        const isLiked = journal.likes.includes(userId);
        const update = isLiked ? { $pull: { likes: userId } } : { $addToSet: { likes: userId } };

        try {
            // If adding a like and it's not the author liking their own post
            if (!isLiked && journal.userId && journal.userId.toString() !== userId.toString()) {
                await Notification.create({
                    recipient: journal.userId,
                    sender: userId,
                    type: 'like',
                    journalId: journal._id,
                    content: 'liked your journal entry'
                });

                // Send Push Notification
                const sender = await User.findById(userId);
                await sendPushNotification(
                    journal.userId,
                    "New Interaction",
                    `${sender.firstName} liked your echo`,
                    { type: 'like', journalId: journal._id }
                );
            }
        } catch (notifErr) {
            console.error("Notification trigger failed:", notifErr.message);
        }

        const updatedJournal = await Journal.findByIdAndUpdate(id, update, { new: true })
            .populate('userId', 'username firstName lastName profilePicture')
            .populate('comments.userId', 'username profilePicture')
            .populate('comments.replies.userId', 'username profilePicture');
        res.status(200).json(updatedJournal);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Add Comment
exports.addComment = async (req, res) => {
    try {
        const { id } = req.params;
        const { text } = req.body;
        const user = await User.findById(req.user.id);

        const journal = await Journal.findByIdAndUpdate(
            id,
            { 
                $push: { 
                    comments: { 
                        userId: user._id, 
                        username: user.username, 
                        profilePicture: user.profilePicture, 
                        text 
                    } 
                } 
            },
            { new: true }
        ).populate('userId', 'username firstName lastName profilePicture')
         .populate('comments.userId', 'username profilePicture')
         .populate('comments.replies.userId', 'username profilePicture');

        // Create notification after update so we can get the comment ID
        if (journal && journal.userId.toString() !== user._id.toString()) {
            const newComment = journal.comments[journal.comments.length - 1];
            await Notification.create({
                recipient: journal.userId,
                sender: user._id,
                type: 'comment',
                journalId: journal._id,
                commentId: newComment._id,
                content: 'commented on your echo'
            });

            // Send Push Notification
            await sendPushNotification(
                journal.userId,
                "New Comment",
                `${user.firstName} commented on your echo`,
                { 
                    type: 'comment', 
                    journalId: journal._id, 
                    commentId: newComment._id, 
                    focusComment: true 
                }
            );
        }

        res.status(201).json(journal);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Add Reply to Comment
exports.addReply = async (req, res) => {
    try {
        const { id, commentId } = req.params;
        const { text } = req.body;
        const user = await User.findById(req.user.id);

        const originalJournal = await Journal.findById(id);
        const targetComment = originalJournal.comments.id(commentId);
        
        if (targetComment && targetComment.userId.toString() !== user._id.toString()) {
            await Notification.create({
                recipient: targetComment.userId,
                sender: user._id,
                type: 'comment',
                journalId: originalJournal._id,
                commentId: commentId, // Include the parent comment ID
                content: 'replied to your comment'
            });

            // Send Push Notification
            await sendPushNotification(
                targetComment.userId,
                "New Reply",
                `${user.firstName} replied to your reflection`,
                { 
                    type: 'comment', 
                    journalId: originalJournal._id, 
                    commentId: commentId, 
                    focusComment: true 
                }
            );
        }

        const journal = await Journal.findOneAndUpdate(
            { _id: id, "comments._id": commentId },
            { 
                $push: { 
                    "comments.$.replies": { 
                        userId: user._id, 
                        username: user.username, 
                        profilePicture: user.profilePicture, 
                        text 
                    } 
                } 
            },
            { new: true }
        ).populate('userId', 'username firstName lastName profilePicture')
         .populate('comments.userId', 'username profilePicture')
         .populate('comments.replies.userId', 'username profilePicture');

        res.status(201).json(journal);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Edit Comment
exports.editComment = async (req, res) => {
    try {
        const { id, commentId } = req.params;
        const { text } = req.body;
        const userId = req.user.id;

        const journal = await Journal.findOneAndUpdate(
            { _id: id, "comments._id": commentId, "comments.userId": userId },
            { $set: { "comments.$.text": text } },
            { new: true }
        ).populate('userId', 'username firstName lastName profilePicture')
         .populate('comments.userId', 'username profilePicture')
         .populate('comments.replies.userId', 'username profilePicture');

        if (!journal) return res.status(404).json({ message: "Comment not found or unauthorized" });
        res.status(200).json(journal);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete Comment
exports.deleteComment = async (req, res) => {
    try {
        const { id, commentId } = req.params;
        const userId = req.user.id;

        const journal = await Journal.findOneAndUpdate(
            { _id: id },
            { $pull: { comments: { _id: commentId, userId: userId } } },
            { new: true }
        ).populate('userId', 'username firstName lastName profilePicture')
         .populate('comments.userId', 'username profilePicture')
         .populate('comments.replies.userId', 'username profilePicture');

        if (!journal) return res.status(404).json({ message: "Unauthorized or not found" });
        res.status(200).json(journal);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Edit Reply
exports.editReply = async (req, res) => {
    try {
        const { id, commentId, replyId } = req.params;
        const { text } = req.body;
        const userId = req.user.id;

        const journal = await Journal.findOneAndUpdate(
            { 
                _id: id, 
                "comments._id": commentId,
                "comments.replies._id": replyId,
                "comments.replies.userId": userId 
            },
            { $set: { "comments.$[comment].replies.$[reply].text": text } },
            { 
                arrayFilters: [{ "comment._id": commentId }, { "reply._id": replyId }],
                new: true 
            }
        ).populate('userId', 'username firstName lastName profilePicture')
         .populate('comments.userId', 'username profilePicture')
         .populate('comments.replies.userId', 'username profilePicture');

        if (!journal) return res.status(404).json({ message: "Reply not found or unauthorized" });
        res.status(200).json(journal);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};