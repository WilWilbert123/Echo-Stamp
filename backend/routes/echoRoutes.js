const express = require('express');
const router = express.Router();
const echoController = require('../controllers/echoController');
const { protect } = require('../middleware/authMiddleware');

// IMPORTANT: Specific routes MUST come BEFORE parameterized routes
router.get('/count/my', protect, echoController.countUserEchoes);  // This MUST be first
router.get('/feed/global', protect, echoController.getGlobalEchoes);

// Parameterized routes (with :params) go AFTER specific routes
router.get('/:userId/:type', protect, echoController.getEchoes);
router.post('/', protect, echoController.createEcho);
router.delete('/:id', protect, echoController.deleteEcho);
router.post('/:id/like', protect, echoController.likeEcho);
router.post('/:id/comment', protect, echoController.commentEcho);
router.post('/:id/comment/:commentId/reply', protect, echoController.replyToComment);
router.delete('/:id/comment/:commentId', protect, echoController.deleteComment);

module.exports = router;