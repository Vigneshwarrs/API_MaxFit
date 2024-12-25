const mongoose = require('mongoose');

const streakSchema = new mongoose.Schema({
    userId: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    activity: {
        type: String,
        enum: ['water', 'sleep', 'workout', 'steps', 'calories'],
        required: true
    },
    date: {type: Date},
    current: {type: Number, default: 0},
    longest: {type: Number, default: 0, min:0},
    lastCompletedDate: {type: Date},
    consecutiveFailedDays: {type: Number, default: 0, min:0},
    streakPeriods: [{
        startDate: Date,
        endDate: Date,
        duration: Number,
        broken: { type: Boolean, default: false },
        reason: String
    }],
    milestones: [{
        days: Number,
        achieved: { type: Boolean, default: false },
        achievedDate: Date
    }],
    statistics: {
        averageStreak: Number,
        totalDaysCompleted: Number,
        completionRate: Number
    }
});

module.exports = mongoose.model('Streak', streakSchema);