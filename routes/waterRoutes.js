const express = require('express');
const router = express.Router();
const {createOrUpdateWater, getWaterByDate, getWaterHistory, deleteWaterRecord} = require('../controllers/waterController');
const { auth } = require('../middlewares/auth');

router.post('/', auth, createOrUpdateWater);
router.get('/', auth, getWaterHistory);
router.get("/:date", auth, getWaterByDate);
router.get('/:id', auth, deleteWaterRecord);

module.exports = router;