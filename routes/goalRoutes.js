const express = require('express');
const router = express.Router();
const {createGoal, getGoalById, getGoals, updateGoal, deleteGoal } = require('../controllers/goalController');
const {auth} = require('../middlewares/auth');

router.post('/', auth, createGoal);
router.get('/', auth, getGoals);
router.get('/:id', auth, getGoalById);
router.put('/:id', auth, updateGoal);
router.delete('/:id', auth, deleteGoal);

module.exports = router;