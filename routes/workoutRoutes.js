const express = require('express');
const router = express.Router();
const {createWorkout, updateWorkout, getWorkoutById, getWorkoutStats, getWorkouts, deleteWorkout} = require('../controllers/workoutController');
const { auth } = require('../middlewares/auth');

router.post('/', auth, createWorkout);
router.get('/:id', auth, getWorkoutById);
router.get('/', auth, getWorkouts);
router.get('/', auth, getWorkoutStats);
router.put('/:id', auth, updateWorkout);
router.delete('/:id', auth, deleteWorkout);

module.exports = router;