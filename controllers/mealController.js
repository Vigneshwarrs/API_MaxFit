const Meal = require("../models/mealSchema");
const Food = require('../models/foodSchema');

exports.createOrUpdateMeal = async (req, res) => {
  try {
    const { mealType, foodItems, customFoodItems } = req.body;
    const userId = req.user._id;
    const date = new Date(req.body.date || Date.now()).setHours(0, 0, 0, 0);
    
    const existingMeal = await Meal.findOne({ userId, date, mealType });

    if (existingMeal) {
      // Handle regular food items
      foodItems?.forEach((food) => {
        const meal = existingMeal.foodItems.find(
          (item) => item.foodId.toString() === food.foodId
        );
        if (meal) {
          meal.quantity += food.quantity;
        } else {
          existingMeal.foodItems.push(food);
        }
      });

      // Handle custom food items
      if (customFoodItems?.length) {
        if (!existingMeal.customFoodItems) {
          existingMeal.customFoodItems = [];
        }
        existingMeal.customFoodItems.push(...customFoodItems);
      }

      // Calculate total calories
      let totalCalories = 0;

      // Calculate calories from regular food items
      for (const item of existingMeal.foodItems) {
        const food = await Food.findById(item.foodId);
        if (food?.nutritionalInfo?.calories) {
          totalCalories += food.nutritionalInfo.calories * item.quantity;
        }
      }

      // Add calories from custom food items
      totalCalories += existingMeal.customFoodItems?.reduce((sum, item) => 
        sum + (item.calories * item.quantity), 0) || 0;

      existingMeal.totalCalories = Math.round(totalCalories * 100) / 100;
      
      await existingMeal.save();
      return res.status(200).json({ meal: existingMeal, msg: "Meals updated!" });
    } 
    
    // Create new meal
    let totalCalories = 0;

    // Calculate calories from regular food items
    if (foodItems?.length) {
      for (const item of foodItems) {
        const food = await Food.findById(item.foodId);
        if (food?.nutritionalInfo?.calories) {
          totalCalories += food.nutritionalInfo.calories * item.quantity;
        }
      }
    }

    // Add calories from custom food items
    if (customFoodItems?.length) {
      totalCalories += customFoodItems.reduce((sum, item) => 
        sum + (item.calories * item.quantity), 0);
    }

    const meal = new Meal({ 
      userId, 
      date, 
      mealType, 
      foodItems: foodItems || [],
      customFoodItems: customFoodItems || [],
      totalCalories: Math.round(totalCalories * 100) / 100
    });

    await meal.save();
    return res.status(200).json({ meal, msg: "Meal created!" });
  } catch (err) {
    console.error(`Error creating or updating meal: ${err}`);
    res.status(500).json({ msg: "Server error during meal creation or update." });
  }
};

exports.getMealByDate = async (req, res) => {
  try {
    const date = new Date(req.params.date).setHours(0, 0, 0, 0);
    const meals = await Meal.find({ userId: req.user._id, date }).populate(
      "foodItems.foodId"
    );
    if (!meals.length) return res.status(404).json({ msg: "Meals not found!" });
    res.status(200).json({ meals, msg: "Meals retrieved!" });
  } catch (err) {
    console.error(`Error retrieving meal: ${err}`);
    res.status(500).json({ msg: "Server error during meal retrieval!" });
  }
};

exports.getMealById = async (req, res) => {
  try {
    const meal = await Meal.findOne({
      _id: req.params.id,
      userId: req.user._id,
    }).populate("foodItems.foodId");
    if (!meal) return res.status(404).json({ msg: "Meal not found!" });
    res.status(200).json({ meal, msg: "Meal retrieved!" });
  } catch (err) {
    console.error(`Error retrieving meal: ${err}`);
    res.status(500).json({ msg: "Server error during meal retrieval!" });
  }
};

exports.updateMeal = async (req, res) => {
  try {
    const updates = { ...req.body };
    
    // If updating food items or custom food items, recalculate total calories
    if (updates.foodItems || updates.customFoodItems) {
      let totalCalories = 0;

      // Calculate calories from regular food items
      if (updates.foodItems?.length) {
        for (const item of updates.foodItems) {
          const food = await Food.findById(item.foodId);
          if (food?.nutritionalInfo?.calories) {
            totalCalories += food.nutritionalInfo.calories * item.quantity;
          }
        }
      }

      // Add calories from custom food items
      if (updates.customFoodItems?.length) {
        totalCalories += updates.customFoodItems.reduce((sum, item) => 
          sum + (item.calories * item.quantity), 0);
      }

      updates.totalCalories = Math.round(totalCalories * 100) / 100;
    }

    const meal = await Meal.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { $set: updates },
      { new: true, runValidators: true }
    ).populate("foodItems.foodId");

    if (!meal) return res.status(404).json({ msg: "Meal not found." });
    res.status(200).json({ meal, msg: "Meal updated successfully!" });
  } catch (err) {
    console.error(`Error updating meal: ${err}`);
    res.status(500).json({ msg: "Server error during meal update!" });
  }
};

exports.deleteMeal = async (req, res) => {
  try {
    const meal = await Meal.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!meal) return res.status(404).json({ msg: "Meal not found." });
    res.status(200).json({ msg: "Meal deleted successfully!" });
  } catch (err) {
    console.error(`Error deleting meal: ${err}`); // Fix error message
    res.status(500).json({ msg: "Server error during meal deletion!" });
  }
};

exports.dailyNutrition = async (req, res) => {
  try {
    const date = new Date(req.params.date || Date.now).setHours(0, 0, 0, 0);
    const meals = await Meal.find({ 
      userId: req.user._id,
      date
    }).populate('foodItems.foodId');
    
    if (!meals.length) {
      return res.status(404).json({ msg: "No meals found for today." });
    }
    
    const nutrition = await meals[0].calculateDailyNutrition();
    res.status(200).json({ nutrition, msg: "Daily nutrition calculated successfully!" });
  } catch (err) {
    console.error("Error calculating daily nutrition:", err);
    res.status(500).json({ msg: "Server error during daily nutrition calculation." });
  }
};

exports.getMealHistory = async (req, res) => {
  try {
    const { startDate, endDate } = req.query; // Changed from req.body to req.query
    const history = await Meal.getHistory(req.user._id, startDate, endDate);
    if (!history.length) {
      return res.status(404).json({ msg: "No meal history found for this period." });
    }
    res.status(200).json({ history, msg: "Meal history retrieved successfully!" });
  } catch (err) {
    console.error(`Error retrieving meal history: ${err}`);
    res.status(500).json({ msg: "Server error during meal history retrieval!" });
  }
};