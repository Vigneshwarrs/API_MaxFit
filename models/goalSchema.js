const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    category: {
        type: String, 
        enum: ['Steps', 'Weight', 'Sleep', 'Water', 'Meal', 'Workout'],
        required: true
    },
    target: {
        type: Number,
        required: true,
        min: 0
    },
    unit: {
        type: String,
        default: "",
    },
    duration: {
        type: String, 
        enum: ['daily', 'weekly', 'monthly'],
        required: true
    },
    progress: {
        type: Number,
        default: 0,
        min: 0
    },
    status: {
        type: String, 
        enum: ['pending', 'in progress', 'completed'],
        default: 'pending'
    },
    startDate: {
        type: Date,
        default: Date.now
    },
    endDate: {
        type: Date,
    }
}, {timestamps: true});

// Hook to update streak when progress is updated
goalSchema.pre('save', async function(next) {
    try {
        if (this.isModified('progress')) {
            const streakService = require('../services/streakService');
            await streakService.update(
                this.userId,
                this.category.toLowerCase(),
                this.progress >= this.target
            );
        }
        next();
    } catch (err) {
        next(err);
    }
});

// Add a virtual or method to get streak info
goalSchema.methods.getStreakInfo = async function() {
    const streakService = require('../services/streakService');
    return streakService.getStreakStat(this.userId, this.category.toLowerCase());
};

module.exports = mongoose.model('Goal', goalSchema);