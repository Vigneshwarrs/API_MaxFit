const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    personalInfo: {
      name: { type: String, trim: true },
      age: {
        type: Number,
        min: 10,
        max: 120,
      },
      gender: {
        type: String,
        enum: ["male", "female", "other"],
      },
      address: { type: String, trim: true },
      picture: { type: String },
      activityLevel: { type: String },
    },
    physicalMetrics: {
      height: { value: {type: Number, min: 0}, unit: {type: String, enum: ['cm', 'ft'], default: 'cm'} },
      weight: { value: {type: Number, min: 0}, unit: {type: String, enum: ['kg', 'lbs'], default: 'kg'} },
    },
    authentication: {
      email: {
        type: String,
        unique: true,
        required: true,
      },
      password: {
        type: String,
        required: true,
      },
      role: {
        type: String,
        enum: ["user", "admin"],
        default: "user",
      },
    },
    accountStatus: {
      isActive: { type: Boolean, default: false },
      isCompleted: { type: Boolean, default: false },
      activateToken: { type: String },
      resetToken: { type: String },
      resetTokenExpire: { type: String },
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("authentication.password")) next();
  const salt = await bcrypt.genSalt(12);
  this.authentication.password = await bcrypt.hash(
    this.authentication.password,
    salt
  );
  next();
});

userSchema.methods.compare = async function (password) {
  return await bcrypt.compare(password, this.authentication.password);
};

module.exports = mongoose.model("User", userSchema);
