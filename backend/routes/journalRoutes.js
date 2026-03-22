const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getJournals, createJournal, deleteJournal,removeJournalMedia,getGlobalJournals } = require('../controllers/journalController');

router.get('/:userId', getJournals);
router.post('/', createJournal);
router.delete('/:id', deleteJournal);
router.patch('/:id/media', removeJournalMedia);
router.get('/global', protect, getGlobalJournals);
module.exports = router;