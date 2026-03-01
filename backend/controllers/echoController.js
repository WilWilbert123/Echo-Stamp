const Echo = require('../models/Echo');

// @desc    Get all memories
// @route   GET /api/echoes
exports.getEchoes = async (req, res) => {
  try {
    const echoes = await Echo.find().sort({ createdAt: -1 });
    res.status(200).json(echoes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new memory
// @route   POST /api/echoes
exports.createEcho = async (req, res) => {
  try {
    const newEcho = await Echo.create(req.body);
    res.status(201).json(newEcho);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};