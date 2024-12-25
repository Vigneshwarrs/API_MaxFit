const express = require('express');
const router = express.Router();
const {updateStreak, getStreakStat, getAllStreaks} = require('../controllers/streakController');
const {auth} = require('../middlewares/auth');

router.post('/', auth, updateStreak);
router.get('/:activity', auth, getStreakStat);
router.get('/', auth, getAllStreaks);

module.exports = router;