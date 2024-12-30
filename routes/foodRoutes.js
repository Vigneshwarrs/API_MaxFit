const express = require('express');
const router = express.Router();
const {createFood,getFoods,getFoodById,updateFood,deleteFood} = require('../controllers/foodController');
const {auth, requireRole} = require('../middlewares/auth');

router.post('/', auth, requireRole(['admin']) , createFood);
router.get('/', auth, requireRole(['admin', 'user']) , getFoods);
router.get('/:id', auth, requireRole(['admin']) , getFoodById);
router.put('/:id', auth, requireRole(['admin']) , updateFood);
router.delete('/:id', auth, requireRole(['admin']) , deleteFood);

module.exports = router;