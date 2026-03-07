const Journal = require('../models/Journal');

exports.getJournals = async (req, res) => {
  try {
    const { userId } = req.params;
    // Strict privacy: Only find journals belonging to the requester
    const journals = await Journal.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json(journals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createJournal = async (req, res) => {
  try {
    
    const newJournal = await Journal.create(req.body);
    res.status(201).json(newJournal);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteJournal = async (req, res) => {
  try {
    const journal = await Journal.findByIdAndDelete(req.params.id);
    if (!journal) return res.status(404).json({ message: "Journal not found" });
    res.status(200).json({ id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.removeJournalMedia = async (req, res) => {
  try {
    const { mediaUri } = req.body;
    const journal = await Journal.findByIdAndUpdate(
      req.params.id,
      { $pull: { media: mediaUri } },
      { new: true }
    );

    if (!journal) return res.status(404).json({ message: "Journal not found" });

    res.status(200).json(journal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};