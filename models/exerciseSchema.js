const mongoose = require("mongoose");

const exerciseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["Cardio", "Strength", "Flexibility", "Balance", "Other"],
      required: true,
    },
    caloriesBurnedPerUnit: {
      type: Number,
      required: true,
      min: 0,
    },
    description: { type: String, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Exercise", exerciseSchema);
