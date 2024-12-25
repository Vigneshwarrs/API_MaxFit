const mongoose = require("mongoose");
const Exercise = require("../models/exerciseSchema");
const Food = require("../models/foodSchema");

require('../configs/connectDB');

const foods = [
  {
    name: "Paneer Butter Masala",
    mealType: "lunch",
    nutritionalInfo: { calories: 400, protein: 12, carbs: 20, fats: 30 },
  },
  {
    name: "Chicken Biryani",
    mealType: "lunch",
    nutritionalInfo: { calories: 600, protein: 25, carbs: 50, fats: 20 },
  },
  {
    name: "Masala Dosa",
    mealType: "breakfast",
    nutritionalInfo: { calories: 300, protein: 6, carbs: 45, fats: 10 },
  },
  {
    name: "Idli Sambar",
    mealType: "breakfast",
    nutritionalInfo: { calories: 250, protein: 8, carbs: 40, fats: 5 },
  },
  {
    name: "Pav Bhaji",
    mealType: "snack",
    nutritionalInfo: { calories: 350, protein: 7, carbs: 55, fats: 12 },
  },
  {
    name: "Rajma Chawal",
    mealType: "lunch",
    nutritionalInfo: { calories: 400, protein: 15, carbs: 60, fats: 10 },
  },
  {
    name: "Chole Bhature",
    mealType: "breakfast",
    nutritionalInfo: { calories: 500, protein: 10, carbs: 65, fats: 20 },
  },
  {
    name: "Aloo Paratha",
    mealType: "breakfast",
    nutritionalInfo: { calories: 350, protein: 6, carbs: 50, fats: 15 },
  },
  {
    name: "Butter Naan",
    mealType: "lunch",
    nutritionalInfo: { calories: 250, protein: 5, carbs: 40, fats: 10 },
  },
  {
    name: "Dal Tadka",
    mealType: "lunch",
    nutritionalInfo: { calories: 300, protein: 10, carbs: 35, fats: 12 },
  },
  {
    name: "Bhindi Masala",
    mealType: "lunch",
    nutritionalInfo: { calories: 200, protein: 5, carbs: 20, fats: 8 },
  },
  {
    name: "Poha",
    mealType: "breakfast",
    nutritionalInfo: { calories: 220, protein: 4, carbs: 35, fats: 5 },
  },
  {
    name: "Upma",
    mealType: "breakfast",
    nutritionalInfo: { calories: 240, protein: 6, carbs: 40, fats: 8 },
  },
  {
    name: "Khaman Dhokla",
    mealType: "snack",
    nutritionalInfo: { calories: 200, protein: 8, carbs: 30, fats: 5 },
  },
  {
    name: "Samosa",
    mealType: "snack",
    nutritionalInfo: { calories: 250, protein: 4, carbs: 30, fats: 12 },
  },
  {
    name: "Pani Puri",
    mealType: "snack",
    nutritionalInfo: { calories: 180, protein: 3, carbs: 25, fats: 6 },
  },
  {
    name: "Sev Puri",
    mealType: "snack",
    nutritionalInfo: { calories: 220, protein: 4, carbs: 30, fats: 8 },
  },
  {
    name: "Misal Pav",
    mealType: "snack",
    nutritionalInfo: { calories: 400, protein: 12, carbs: 50, fats: 15 },
  },
  {
    name: "Palak Paneer",
    mealType: "lunch",
    nutritionalInfo: { calories: 300, protein: 12, carbs: 20, fats: 15 },
  },
  {
    name: "Kadai Paneer",
    mealType: "lunch",
    nutritionalInfo: { calories: 320, protein: 12, carbs: 25, fats: 18 },
  },
  {
    name: "Baingan Bharta",
    mealType: "lunch",
    nutritionalInfo: { calories: 200, protein: 4, carbs: 15, fats: 8 },
  },
  {
    name: "Rasam Rice",
    mealType: "lunch",
    nutritionalInfo: { calories: 280, protein: 6, carbs: 45, fats: 8 },
  },
  {
    name: "Sambar Rice",
    mealType: "lunch",
    nutritionalInfo: { calories: 300, protein: 8, carbs: 50, fats: 6 },
  },
  {
    name: "Vada Pav",
    mealType: "snack",
    nutritionalInfo: { calories: 300, protein: 6, carbs: 40, fats: 15 },
  },
  {
    name: "Roti",
    mealType: "lunch",
    nutritionalInfo: { calories: 80, protein: 3, carbs: 15, fats: 1 },
  },
  {
    name: "Plain Rice",
    mealType: "lunch",
    nutritionalInfo: { calories: 200, protein: 4, carbs: 45, fats: 0 },
  },
  {
    name: "Curd Rice",
    mealType: "lunch",
    nutritionalInfo: { calories: 250, protein: 6, carbs: 35, fats: 8 },
  },
  {
    name: "Mango Lassi",
    mealType: "snack",
    nutritionalInfo: { calories: 150, protein: 6, carbs: 25, fats: 3 },
  },
  {
    name: "Vegetable Pulao",
    mealType: "lunch",
    nutritionalInfo: { calories: 300, protein: 7, carbs: 50, fats: 10 },
  },
  {
    name: "Gulab Jamun",
    mealType: "snack",
    nutritionalInfo: { calories: 150, protein: 2, carbs: 30, fats: 5 },
  },
  {
    name: "Jalebi",
    mealType: "snack",
    nutritionalInfo: { calories: 180, protein: 2, carbs: 35, fats: 8 },
  },
  {
    name: "Rasgulla",
    mealType: "snack",
    nutritionalInfo: { calories: 120, protein: 3, carbs: 20, fats: 2 },
  },
  {
    name: "Carrot Halwa",
    mealType: "snack",
    nutritionalInfo: { calories: 250, protein: 5, carbs: 40, fats: 8 },
  },
];

const exercises = [
  { name: "Running", type: "cardio", caloriesBurnedPerUnit: 10 },
  { name: "Cycling", type: "cardio", caloriesBurnedPerUnit: 8 },
  { name: "Swimming", type: "cardio", caloriesBurnedPerUnit: 12 },
  { name: "Jump Rope", type: "cardio", caloriesBurnedPerUnit: 13 },
  { name: "Rowing", type: "cardio", caloriesBurnedPerUnit: 11 },
  { name: "Push Ups", type: "strength", caloriesBurnedPerUnit: 5 },
  { name: "Pull Ups", type: "strength", caloriesBurnedPerUnit: 6 },
  { name: "Plank", type: "strength", caloriesBurnedPerUnit: 4 },
  { name: "Squats", type: "strength", caloriesBurnedPerUnit: 7 },
  { name: "Lunges", type: "strength", caloriesBurnedPerUnit: 6 },
  { name: "Bench Press", type: "strength", caloriesBurnedPerUnit: 8 },
  { name: "Deadlifts", type: "strength", caloriesBurnedPerUnit: 9 },
  { name: "Leg Press", type: "strength", caloriesBurnedPerUnit: 7 },
  { name: "Shoulder Press", type: "strength", caloriesBurnedPerUnit: 6 },
  { name: "Yoga (Hatha)", type: "flexibility", caloriesBurnedPerUnit: 3 },
  { name: "Yoga (Vinyasa)", type: "flexibility", caloriesBurnedPerUnit: 5 },
  { name: "Stretching", type: "flexibility", caloriesBurnedPerUnit: 2 },
  { name: "Pilates", type: "flexibility", caloriesBurnedPerUnit: 4 },
  { name: "Tai Chi", type: "flexibility", caloriesBurnedPerUnit: 3 },
  { name: "Walking", type: "cardio", caloriesBurnedPerUnit: 4 },
  { name: "Hiking", type: "cardio", caloriesBurnedPerUnit: 6 },
  { name: "Dancing", type: "cardio", caloriesBurnedPerUnit: 8 },
  { name: "Zumba", type: "cardio", caloriesBurnedPerUnit: 10 },
  { name: "Boxing", type: "cardio", caloriesBurnedPerUnit: 12 },
  { name: "Shadow Boxing", type: "cardio", caloriesBurnedPerUnit: 8 },
  { name: "Martial Arts", type: "cardio", caloriesBurnedPerUnit: 10 },
  { name: "Burpees", type: "strength", caloriesBurnedPerUnit: 8 },
  { name: "Mountain Climbers", type: "strength", caloriesBurnedPerUnit: 7 },
  { name: "Russian Twists", type: "strength", caloriesBurnedPerUnit: 6 },
  { name: "Bicep Curls", type: "strength", caloriesBurnedPerUnit: 4 },
  { name: "Tricep Dips", type: "strength", caloriesBurnedPerUnit: 5 },
  { name: "Kettlebell Swings", type: "strength", caloriesBurnedPerUnit: 9 },
  { name: "Battle Ropes", type: "strength", caloriesBurnedPerUnit: 10 },
  { name: "Sprinting", type: "cardio", caloriesBurnedPerUnit: 15 },
  { name: "Elliptical Trainer", type: "cardio", caloriesBurnedPerUnit: 7 },
  { name: "Stair Climber", type: "cardio", caloriesBurnedPerUnit: 9 },
  { name: "Wall Sits", type: "strength", caloriesBurnedPerUnit: 5 },
  { name: "Handstands", type: "balance", caloriesBurnedPerUnit: 6 },
  { name: "Balance Board", type: "balance", caloriesBurnedPerUnit: 4 },
  { name: "Side Plank", type: "strength", caloriesBurnedPerUnit: 4 },
  { name: "Incline Push Ups", type: "strength", caloriesBurnedPerUnit: 5 },
  { name: "Decline Push Ups", type: "strength", caloriesBurnedPerUnit: 6 },
  { name: "Box Jumps", type: "strength", caloriesBurnedPerUnit: 8 },
  { name: "High Knees", type: "cardio", caloriesBurnedPerUnit: 10 },
  { name: "Butt Kicks", type: "cardio", caloriesBurnedPerUnit: 8 },
  { name: "Jumping Jacks", type: "cardio", caloriesBurnedPerUnit: 9 },
  { name: "Flutter Kicks", type: "strength", caloriesBurnedPerUnit: 7 },
  { name: "Crunches", type: "strength", caloriesBurnedPerUnit: 4 },
  { name: "Leg Raises", type: "strength", caloriesBurnedPerUnit: 5 },
  { name: "Seated Twists", type: "balance", caloriesBurnedPerUnit: 3 },
  { name: "Windmills", type: "balance", caloriesBurnedPerUnit: 4 },
  { name: "Calf Raises", type: "strength", caloriesBurnedPerUnit: 3 },
  { name: "Skipping", type: "cardio", caloriesBurnedPerUnit: 12 },
  { name: "Chin Ups", type: "strength", caloriesBurnedPerUnit: 6 },
  { name: "Hip Thrusts", type: "strength", caloriesBurnedPerUnit: 5 },
  { name: "Treadmill Running", type: "cardio", caloriesBurnedPerUnit: 10 },
  { name: "Stationary Bike", type: "cardio", caloriesBurnedPerUnit: 8 },
  { name: "Foam Rolling", type: "flexibility", caloriesBurnedPerUnit: 2 },
  { name: "Bird Dog", type: "balance", caloriesBurnedPerUnit: 4 },
  { name: "Superman", type: "balance", caloriesBurnedPerUnit: 4 },
  { name: "Side Lunges", type: "strength", caloriesBurnedPerUnit: 6 },
  { name: "Broad Jumps", type: "cardio", caloriesBurnedPerUnit: 8 },
  { name: "Skater Jumps", type: "cardio", caloriesBurnedPerUnit: 9 },
  { name: "Roll Outs", type: "strength", caloriesBurnedPerUnit: 6 },
  { name: "Cobra Stretch", type: "flexibility", caloriesBurnedPerUnit: 2 },
  { name: "Cat-Cow Stretch", type: "flexibility", caloriesBurnedPerUnit: 2 },
  { name: "Child's Pose", type: "flexibility", caloriesBurnedPerUnit: 2 },
  { name: "Reverse Lunges", type: "strength", caloriesBurnedPerUnit: 6 },
  { name: "Sumo Squats", type: "strength", caloriesBurnedPerUnit: 7 },
  { name: "Farmer's Walk", type: "strength", caloriesBurnedPerUnit: 6 },
  { name: "Ball Slams", type: "strength", caloriesBurnedPerUnit: 8 },
];

const seedDB = async () => {
    await Exercise.deleteMany({});
    await Exercise.insertMany(exercises);
    console.log('Exercises data seeded successfully!!');
    await Food.deleteMany({});
    await Food.insertMany(foods);
    console.log('Foods data seeded successfully!!');
};

seedDB().then(() => {
    mongoose.connection.close();
});