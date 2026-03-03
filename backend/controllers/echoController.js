const Echo = require('../models/Echo');

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
        }).sort({ createdAt: -1 });

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
            type: req.body.type || 'mode'
        };

        const newEcho = await Echo.create(echoData);
        
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