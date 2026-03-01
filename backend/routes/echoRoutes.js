const express = require('express');
const router = express.Router();
const { getEchoes, createEcho } = require('../controllers/echoController');

router.route('/')
  .get(getEchoes)
  .post(createEcho);

module.exports = router;