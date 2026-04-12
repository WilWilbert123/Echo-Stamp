const express = require('express');
const router = express.Router();
const { getEchoes, createEcho, deleteEcho, getGlobalEchoes, likeEcho, commentEcho, replyToComment, deleteComment } = require('../controllers/echoController');

router.get('/feed/global', getGlobalEchoes);

router.get('/:userId/:type', getEchoes);

 
router.post('/', createEcho);

// For deleting
router.delete('/:id', deleteEcho);

// Social interactions
router.post('/:id/like', likeEcho);
router.post('/:id/comment', commentEcho);
router.post('/:id/comment/:commentId/reply', replyToComment);
router.delete('/:id/comment/:commentId', deleteComment);

module.exports = router;