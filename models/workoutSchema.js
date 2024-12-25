const mongoose = require('mongoose');

const workoutSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    exercises: [{
        exerciseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Exersice',
            required: true,
        },
        duration: {type: Number, min: 0},
        sets: {type: Number, min: 0},
        reps: {type: Number, min:0},
        caloriesBurned: {type: Number, min:0},
    }],
    date: {type: Date, default: Date.now}
}, {timestamps: true});

module.exports = mongoose.model('Workout', workoutSchema);