const express = require('express');
const router = express.Router();
const {createGoal, getGoalById, getGoals, getGoalsByCategory, getPrimaryGoals, getSecondaryGoals, updateGoal, deleteGoal } = require('../controllers/goalController');
const {auth} = require('../middlewares/auth');

router.post('/', auth, createGoal);
router.get('/', auth, getGoals);
router.get('/primary', auth, getPrimaryGoals);
router.get('/secondary', auth, getSecondaryGoals);
router.get('/:category', auth, getGoalsByCategory)
router.get('/:id', auth, getGoalById);
router.put('/:id', auth, updateGoal);
router.delete('/:id', auth, deleteGoal);

module.exports = router;