const mongoose = require("mongoose");

const sleepSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: { type: Date, default: Date.now },
    bedTime: { type: Date, required: true },
    wakeTime: { type: Date, required: true },
    duration: { type: Number, required: true },
    quality: { type: Number, min: 1, max: 10, required: true },
    mood: {
      type: String,
      enum: [
        // Emotional States
        "Refreshed",
        "Energetic",
        "Calm",
        "Positive",
        "Neutral",

        // Tiredness Levels
        "Tired",
        "Exhausted",
        "Groggy",
        "Sluggish",

        // Negative States
        "Irritable",
        "Anxious",
        "Stressed",
        "Overwhelmed",

        // Physical Sensations
        "Well-rested",
        "Achy",
        "Sore",
        "Stiff",

        // Cognitive States
        "Focused",
        "Cloudy",
        "Alert",
        "Distracted",
      ],
      requried: true,
    },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

const moodCategories = {
  positive: [
    "Refreshed",
    "Energetic",
    "Calm",
    "Positive",
    "Well-rested",
    "Focused",
    "Alert",
  ],
  neutral: ["Neutral"],
  negative: [
    "Tired",
    "Exhausted",
    "Groggy",
    "Sluggish",
    "Irritable",
    "Anxious",
    "Stressed",
    "Overwhelmed",
    "Achy",
    "Sore",
    "Stiff",
    "Cloudy",
    "Distracted",
  ],
};

sleepSchema.methods.getMoodInsights = async function () {
  const category = Object.keys(moodCategories).find(category => moodCategories[category].includes(this.mood));
  const insights = {
      positive: "Great night's sleep! You're starting the day on the right foot.",
      neutral: "Average sleep. Some room for improvement.",
      negative: "Looks like you might need to adjust your sleep routine.",
      unknown: "Unable to provide specific insights.",
  };

  return {
      category: category || "unknown",
      insight: insights[category] || insights.unknown,
  };
};
