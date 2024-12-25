const streakService = require("../services/streakService");

exports.updateStreak = async (req, res) => {
  try {
    const { activity, date } = req.body;
    const streak = await streakService.update(req.user._id, activity, date);
    res.status(200).json({ success: true, data: streak });
  } catch (err) {
    console.error("Error in updateStreak controller:", err);
    return res.status(500).json({
      success: false,
      msg: `Error updating streak: ${err.message}`,
    });
  }
};

exports.getStreakStat = async (req, res) => {
  try {
    const { activity } = req.params;
    const stats = await streakService.getStreakStat(req.user._id, activity);

    return res.status(200).json({ success: true, msg: "", data: stats });
  } catch (err) {
    console.error("Error in getStreakStats controller:", err);
    return res.status(500).json({
      success: false,
      msg: `Error getting streak stats: ${err.message}`,
    });
  }
};

exports.getAllStreaks = async (req, res) => {
  try {
    const streaks = await streakService.getAllStreaks(req.user._id);
    res.status(200).json({ success: true, data: streaks });
  } catch (err) {
    console.error("Error in getAllStreaks controller:", err);
    return res.status(500).json({
      success: false,
      msg: `Error getting all streaks: ${err.message}`,
    });
  }
};
