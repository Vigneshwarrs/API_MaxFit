const express = require('express');
const router = express.Router();
const {createWeight, getWeight, updateWeight, deleteWeight} = require('../controllers/weightController');
const { auth } = require('../middlewares/auth');

router.post('/', auth, createWeight);
router.get('/', auth, getWeight);
router.put('/:id', auth, updateWeight);
router.delete('/:id', auth, deleteWeight);

module.exports = router;