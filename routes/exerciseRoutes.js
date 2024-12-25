const express = require('express');
const router = express.Router();
const {createExercise,getExercises,getExerciseById,updateExercise,deleteExercise} = require('../controllers/exerciseController');
const {auth, requireRole} = require('../middlewares/auth');

router.post('/', auth, requireRole(['admin']) , createExercise);
router.get('/', auth, requireRole(['admin']) , getExercises);
router.get('/:id', auth, requireRole(['admin']) , getExerciseById);
router.put('/:id', auth, requireRole(['admin']) , updateExercise);
router.delete('/:id', auth, requireRole(['admin']) , deleteExercise);

module.exports = router;