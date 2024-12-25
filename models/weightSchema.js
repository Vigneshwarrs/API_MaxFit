const mongoose = require('mongoose');

const weightSchema = new mongoose.Schema({
    userId: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    weightEntries: [{
        value: {type: Number, required: true, min: 20, max:300},
        unit: {type: String, enum: ['kg', 'lbs'], default: 'kg'},
        date: {type: Date, default: Date.now},
        notes: {type: String},
        bodyMeasurement: {
            unit: {type: String, enum: ['cm', 'inch']},
            waist: {type: Number},
            hips: {type: Number},
            chest: {type: Number}
        }
    }],
    analytics: {
        weightProgress: {
            start: Number,
            end: Number,
            totalChange: Number,
            changePercentage: Number
        },
        latestBmi: {
            value: Number,
            category: { type: String, enum: ['underWeight', 'normal', 'overweight', 'obese'] },
            date: Date
        },
        bmiHistory: [{
            value: Number,
            category: { type: String, enum: ['underWeight', 'normal', 'overweight', 'obese'] },
            date: Date
        }],
        weightTrend: {
            weekly: Number,
            monthly: Number
        }
    }
}, {timestamps: true});

module.exports = mongoose.model('Weight', weightSchema);