
const express = require('express');
const router = express.Router();
const {createSleep, getSleepByDate,getMoodInsights,getSleepById,getSleepStatistics,updateSleep,deleteSleep} = require('../controllers/sleepController');
const {auth} = require('../middlewares/auth');

router.post('/', auth, createSleep);
router.get('/', auth, getSleepStatistics);
router.get('/:id', auth, getSleepById);
router.get('/:date', auth, getSleepByDate);
router.get('/mood', auth, getMoodInsights);
router.put('/:id', auth, updateSleep);
router.delete('/:id', auth, deleteSleep);

module.exports = router;