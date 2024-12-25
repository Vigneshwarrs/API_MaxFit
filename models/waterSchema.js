const mongoose = require('mongoose');

const waterSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    date: {type: Date, required: true},
    dailyGoal: {
        amount: {type: Number, required: true, min:250},
        unit: {type: String, enum:['ml','oz','l'], default: 'ml'}
    },
    intakeEntries: [{
        amount: {type: Number, required: true, min:250},
        unit: {type: String, enum: ['ml','oz','l'], default: 'ml'},
        source: {type: String, enum: ['water', 'tea', 'coffee', 'juice']}
    }],
    dailyStats: {
        totalIntake: {type: Number, default: 0},
        goalAchieved: {type: Boolean, default: false},
        completionPercentage: {type: Number, min:0, max:100, default: 0},
        totalEntries: {type: Number, default: 0}
    }
}, {timestamps: true});


module.exports = mongoose.model('Water', waterSchema);