const express = require('express');
const router = express.Router();
const { startLiveShare, stopLiveShare, updateMyLiveLocation, getActiveSharesForMe, getMyOutgoingShare } = require('../controllers/shareLocationController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.post('/start', startLiveShare);
router.post('/stop', stopLiveShare);
router.post('/update', updateMyLiveLocation);
router.get('/active', getActiveSharesForMe);
router.get('/my-status', getMyOutgoingShare);

module.exports = router;