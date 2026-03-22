const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { 
    getJournals, 
    createJournal, 
    deleteJournal, 
    removeJournalMedia, 
    getGlobalJournals 
} = require('../controllers/journalController');


router.get('/global', protect, getGlobalJournals);
router.get('/:userId', protect, getJournals); 
 
router.post('/', protect, createJournal);
router.delete('/:id', protect, deleteJournal);
router.patch('/:id/media', protect, removeJournalMedia);

module.exports = router;