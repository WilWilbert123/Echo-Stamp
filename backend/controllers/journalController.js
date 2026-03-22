const Journal = require('../models/Journal');
const User = require('../models/User');  
const cloudinary = require('cloudinary').v2;
const mongoose = require('mongoose');
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
         
        const currentUserId = req.user?.id; 
 
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

        const journals = await Journal.find(query)
            .populate('userId', 'username firstName lastName') 
            .sort({ createdAt: -1 });

        console.log(`Found ${journals.length} journals for feed.`);
        res.status(200).json(journals);
    } catch (error) {
        console.error("Global Feed Error:", error);
        res.status(500).json({ message: error.message });
    }
};

// Get all journals for a specific user  
exports.getJournals = async (req, res) => {
    try {
        const { userId } = req.params;
       
        const journals = await Journal.find({ userId })
            .populate('userId', 'username')
            .sort({ createdAt: -1 });
        res.status(200).json(journals);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create a new journal entry
exports.createJournal = async (req, res) => {
    try {
        const newJournal = await Journal.create(req.body);
        res.status(201).json(newJournal);
    } catch (error) {
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
        );

        if (!journal) return res.status(404).json({ message: "Journal not found" });
        res.status(200).json(journal);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};