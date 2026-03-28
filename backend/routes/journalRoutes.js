const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { 
    getJournals, 
    createJournal, 
    deleteJournal, 
    removeJournalMedia, 
    getGlobalJournals,
    toggleLike,
    addComment,
    addReply
} = require('../controllers/journalController');


router.get('/global', protect, getGlobalJournals);
router.get('/:userId', protect, getJournals); 
 
router.post('/', protect, createJournal);
router.delete('/:id', protect, deleteJournal);
router.patch('/:id/media', protect, removeJournalMedia);

router.post('/:id/like', protect, toggleLike);
router.post('/:id/comment', protect, addComment);
router.post('/:id/comment/:commentId/reply', protect, addReply);


module.exports = router;