const express = require('express');
const router = express.Router();
const { getJournals, createJournal, deleteJournal,removeJournalMedia } = require('../controllers/journalController');

router.get('/:userId', getJournals);
router.post('/', createJournal);
router.delete('/:id', deleteJournal);
router.patch('/:id/media', removeJournalMedia);

module.exports = router;