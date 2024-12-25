const User = require("../models/userSchema");

const sanitizeUser = (user) => {
  const safeUser = user.toObject();
  delete safeUser.authentication.password;
  delete safeUser.accountStatus.activateToken;
  delete safeUser.accountStatus.resetToken;
  return safeUser;
};

exports.updateUser = async (req, res) => {
  try {
    const { age, picture, gender, height, weight, address, activityLevel } =
      req.body;
    const user = await User.findById(req.user._id);

    if (age) user.personalInfo.age = age;
    if (picture) user.personalInfo.picture = picture;
    if (gender) user.personalInfo.gender = gender;
    if (height) user.physicalMetrics.height = height;
    if (weight) user.physicalMetrics.weight = weight;
    if (address) user.personalInfo.address = address;
    if (activityLevel) user.personalInfo.activityLevel = activityLevel;

    user.accountStatus.isCompleted = !!(
      user.personalInfo.name &&
      user.personalInfo.age &&
      user.personalInfo.gender &&
      user.physicalMetrics.height &&
      user.physicalMetrics.weight
    );

    const updatedUser = await user.save();

    res
      .status(201)
      .json({
        user: sanitizeUser(updatedUser),
        msg: "Profile Updated Succesfully!",
      });
  } catch (err) {
    res
      .status(500)
      .json({ msg: `Server error during update profile. Error is ${err}` });
  }
};

exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    res
      .status(200)
      .json({ user: sanitizeUser(user), msg: "Profile Retrived!" });
  } catch (err) {
    res
      .status(500)
      .json({ msg: `Server error during retring profile. Error is ${err}` });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.user._id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    res
      .status(204)
      .json({
        msg: `Sorry for leaving us ${user.personalInfo.name}!. But Your profile is dropped. `,
      });
  } catch (err) {
    res
      .status(500)
      .json({ msg: `Server error during delete profile. Error is ${err}` });
  }
};
