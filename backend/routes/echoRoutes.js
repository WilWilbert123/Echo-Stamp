const express = require('express');
const router = express.Router();
const { getEchoes, createEcho, deleteEcho, getGlobalEchoes } = require('../controllers/echoController');

router.get('/feed/global', getGlobalEchoes);

router.get('/:userId/:type', getEchoes);

 
router.post('/', createEcho);

// For deleting
router.delete('/:id', deleteEcho);

module.exports = router;