const express = require('express');
const router = express.Router();
const {createFood,getFoods,getFoodById,updateFood,deleteFood} = require('../controllers/foodController');

router.post('/', createFood);
router.get('/', getFoods);
router.get('/:id',getFoodById);
router.put('/:id', updateFood);
router.delete('/:id', deleteFood);

module.exports = router;