const express = require('express');
const router = express.Router();
const { getLeaderboard } = require('../controllers/gamificationController');

router.get('/leaderboard/:type', getLeaderboard);

module.exports = router;