const mongoose = require('mongoose');

const workoutSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    type: {
        type: String,
        enum: ['cardio', 'strength', 'flexibility', 'hybrid'],
        required: true
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
        intensity: {type: String, enum: ['low', 'moderate', 'high'], required: true},
    }],
    notes: {
        preWorkout: String,
        postWorkout: String,
        energyLevel: { type: Number, min: 1, max: 10 },
        difficultyLevel: { type: Number, min: 1, max: 10 }
    },
    date: {type: Date, default: Date.now}
}, {timestamps: true});

module.exports = mongoose.model('Workout', workoutSchema);