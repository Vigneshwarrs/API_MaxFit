const mongoose = require('mongoose');

const foodSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true
    },
    mealType: {
        type: String,
        enum: ["Breakfast", "Lunch", "Dinner", "Snack"],
    },
    nutritionalInfo: {
        calories: {type: Number, min: 0, },
        protein: {type: Number, min: 0, },
        carbs: {type: Number, min: 0, },
        fats: {type: Number, min: 0, },
        fiber: {type: Number, min: 0, default: 0 },
        sugar: {type: Number, min: 0, default: 0},
    }
}, {timestamps: true});

module.exports = mongoose.model("Food", foodSchema);