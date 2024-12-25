const mongoose = require("mongoose");
const Food = require("./foodSchema");

const mealSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: { type: String, trim: true },
    mealType: { 
      type: String, 
      enum: ["breakfast", "lunch", "dinner", "snack"],
      index: true,
    },
    foodItems: [
      {
        foodId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Food",
          required: true,
        },
        quantity: { type: Number, required: true, min: 0 },
      },
    ],
    date: { 
      type: Date, 
      default: Date.now,
      index: true, 
    },
    totalCalories: { type: Number, default: 0 },
    customFoodItems: [{
      name: { type: String, required: true },
      calories: { type: Number, required: true },
      protein: { type: Number },
      carbs: { type: Number },
      fats: { type: Number },
      quantity: { type: Number, required: true }
    }],
  },
  { 
    timestamps: true,
    indexes: [
      { userId: 1, date: 1 },
      { userId: 1, mealType: 1, date: 1 }
    ]
  }
);

mealSchema.methods.calculateDailyNutrition = async function () {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const meals = await this.constructor.find({
      userId: this.userId,
      date: { 
        $gte: startOfDay,
        $lte: endOfDay
      }
    }).populate('foodItems.foodId');

    const nutrition = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fats: 0,
      fiber: 0,
      sugar: 0
    };

    meals.forEach(meal => {
      meal.foodItems.forEach(item => {
        if (item.foodId && item.foodId.nutritionalInfo) {
          const { nutritionalInfo } = item.foodId;
          const quantity = item.quantity || 0;

          nutrition.calories += (nutritionalInfo.calories || 0) * quantity;
          nutrition.protein += (nutritionalInfo.protein || 0) * quantity;
          nutrition.carbs += (nutritionalInfo.carbs || 0) * quantity;
          nutrition.fats += (nutritionalInfo.fats || 0) * quantity;
          nutrition.fiber += (nutritionalInfo.fiber || 0) * quantity;
          nutrition.sugar += (nutritionalInfo.sugar || 0) * quantity;
        }
      });
    });

    // Round all values to 2 decimal places
    Object.keys(nutrition).forEach(key => {
      nutrition[key] = Math.round(nutrition[key] * 100) / 100;
    });

    return nutrition;
  } catch (error) {
    console.error('Error calculating daily nutrition:', error);
    throw error;
  }
};

mealSchema.statics.getHistory = async function (userId, startDate, endDate) {
  if (!userId || !startDate || !endDate) {
    throw new Error('Missing required parameters for getHistory');
  }

  try {
    const history = await this.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          date: {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
          }
        }
      },
      {
        $lookup: {
          from: 'foods',
          localField: 'foodItems.foodId',
          foreignField: '_id',
          as: 'foodDetails'
        }
      },
      {
        $unwind: {
          path: '$foodItems',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $unwind: {
          path: '$foodDetails',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $addFields: {
          dailyNutrition: {
            calories: {
              $multiply: [
                { $ifNull: ['$foodDetails.nutritionalInfo.calories', 0] },
                { $ifNull: ['$foodItems.quantity', 0] }
              ]
            },
            protein: {
              $multiply: [
                { $ifNull: ['$foodDetails.nutritionalInfo.protein', 0] },
                { $ifNull: ['$foodItems.quantity', 0] }
              ]
            },
            carbs: {
              $multiply: [
                { $ifNull: ['$foodDetails.nutritionalInfo.carbs', 0] },
                { $ifNull: ['$foodItems.quantity', 0] }
              ]
            },
            fats: {
              $multiply: [
                { $ifNull: ['$foodDetails.nutritionalInfo.fats', 0] },
                { $ifNull: ['$foodItems.quantity', 0] }
              ]
            },
            fiber: {
              $multiply: [
                { $ifNull: ['$foodDetails.nutritionalInfo.fiber', 0] },
                { $ifNull: ['$foodItems.quantity', 0] }
              ]
            },
            sugar: {
              $multiply: [
                { $ifNull: ['$foodDetails.nutritionalInfo.sugar', 0] },
                { $ifNull: ['$foodItems.quantity', 0] }
              ]
            }
          }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
            mealType: '$mealType'
          },
          calories: { $sum: '$dailyNutrition.calories' },
          protein: { $sum: '$dailyNutrition.protein' },
          carbs: { $sum: '$dailyNutrition.carbs' },
          fats: { $sum: '$dailyNutrition.fats' },
          fiber: { $sum: '$dailyNutrition.fiber' },
          sugar: { $sum: '$dailyNutrition.sugar' },
          meals: {
            $push: {
              foodItems: '$foodItems',
              foodDetails: '$foodDetails'
            }
          }
        }
      },
      {
        $group: {
          _id: '$_id.date',
          mealTypes: {
            $push: {
              type: '$_id.mealType',
              calories: '$calories',
              protein: '$protein',
              carbs: '$carbs',
              fats: '$fats',
              fiber: '$fiber',
              sugar: '$sugar',
              meals: '$meals'
            }
          },
          totalCalories: { $sum: '$calories' },
          totalProtein: { $sum: '$protein' },
          totalCarbs: { $sum: '$carbs' },
          totalFats: { $sum: '$fats' },
          totalFiber: { $sum: '$fiber' },
          totalSugar: { $sum: '$sugar' }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Round all nutritional values to 2 decimal places
    return history.map(day => ({
      ...day,
      totalCalories: Math.round(day.totalCalories * 100) / 100,
      totalProtein: Math.round(day.totalProtein * 100) / 100,
      totalCarbs: Math.round(day.totalCarbs * 100) / 100,
      totalFats: Math.round(day.totalFats * 100) / 100,
      totalFiber: Math.round(day.totalFiber * 100) / 100,
      totalSugar: Math.round(day.totalSugar * 100) / 100,
      mealTypes: day.mealTypes.map(meal => ({
        ...meal,
        calories: Math.round(meal.calories * 100) / 100,
        protein: Math.round(meal.protein * 100) / 100,
        carbs: Math.round(meal.carbs * 100) / 100,
        fats: Math.round(meal.fats * 100) / 100,
        fiber: Math.round(meal.fiber * 100) / 100,
        sugar: Math.round(meal.sugar * 100) / 100
      }))
    }));
  } catch (error) {
    console.error('Error in getHistory:', error);
    throw error;
  }
};

// Add pre-save middleware to ensure date is set to midnight
mealSchema.pre('save', function(next) {
  if (this.date) {
    const date = new Date(this.date);
    date.setHours(0, 0, 0, 0);
    this.date = date;
  }
  next();
});

const Meal = mongoose.model('Meal', mealSchema);
module.exports = Meal;