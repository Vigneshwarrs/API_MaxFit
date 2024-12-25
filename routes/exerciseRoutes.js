const express = require('express');
const router = express.Router();
const {createExercise,getExercises,getExerciseById,updateExercise,deleteExercise} = require('../controllers/exerciseController');

router.post('/', createExercise);
router.get('/', getExercises);
router.get('/:id', getExerciseById);
router.put('/:id', updateExercise);
router.delete('/:id', deleteExercise);

module.exports = router;