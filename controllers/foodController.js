const Food = require('../models/foodSchema');

exports.createFood = async (req, res) => {
    try{
        const {name, mealType, calories, protein, carbs, fats, sugar, fiber} = req.body;
        const food = new Food({name, mealType, nutritionalInfo: {calories, protein, carbs, fats, sugar, fiber}});
        await food.save();
        res.status(201).json({food, msg:"Food created successfully"});
    }catch(err) {
        res.status(500).json({msg: `Server error during create food. Error is ${err}`});
    }
};

exports.getFoods = async (req, res) => {
    try{
        const foods = await Food.find();
        
        res.stats(200).json({foods, msg:"Foods retrived!"});
    }catch(err) {
        res.status(500).json({msg: `Server error during get food. Error is ${err}`});
    }
}

exports.getFoodById = async (req, res) => {
    try{
        const {id} = req.params;
        const food = await Food.findById(id);
        if(!food) return res.status(404).json("Food not found!");
        res.status(200).json({food, msg:"Food retrived!"});
    }catch(err) {
        res.status(500).json({msg: `Server error during get one food. Error is ${err}`});
    }
}

exports.updateFood = async (req, res) => {
    try{
        const {id} = req.params;
        const food = await Food.findOne(id);
        const {name, mealType, calories, protein, carbs, fats, sugar, fiber} = req.body;
        if(name) food.name = name;
        if(mealType) food.mealType = mealType;
        if(calories) food.calories = calories;
        if(protein) food.protein = protein;
        if(carbs) food.carbs = carbs;
        if(fats) food.fats = fats;
        if(sugar) food.sugar = sugar;
        if(fiber) food.fiber = fiber;
        const updatedFood = await food.save();
        res.status(200).json({food: updatedFood, msg: "Food is updataed"});
    }catch(err) {
        res.status(500).json({msg: `Server error during update food. Error is ${err}`});
    }
}

exports.deleteFood = async (req, res) => {
    try{
        const {id} = req.params;
        await Food.findByIdAndDelete(id);
        res.status(204).json({msg: "Food deleted!"});
    }catch(err) {
        res.status(500).json({msg: `Server error during delete food. Error is ${err}`});
    }
}