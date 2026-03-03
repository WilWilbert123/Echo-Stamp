const express = require('express');
const router = express.Router();
const { getEchoes, createEcho, deleteEcho } = require('../controllers/echoController');

 
router.get('/:userId/:type', getEchoes);

 
router.post('/', createEcho);

// For deleting
router.delete('/:id', deleteEcho);

module.exports = router;