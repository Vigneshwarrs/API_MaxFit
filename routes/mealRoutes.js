const express = require('express');
const router = express.Router();
const {createOrUpdateMeal,getMealByDate,getMealById,getMealHistory,updateMeal,dailyNutrition,deleteMeal} = require('../controllers/mealController');
const {auth} = require('../middlewares/auth');

router.post('/', auth, createOrUpdateMeal);
router.get('/', auth, getMealHistory);
router.get('/:date', auth, getMealByDate);
router.get('/:id', auth, getMealById);
router.get('/daily/:date', auth, dailyNutrition);
router.put('/:id', auth, updateMeal);
router.delete('/:id', auth, deleteMeal);

module.exports = router;