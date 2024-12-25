const Streak = require('../models/streakSchema');

const normalizeDate = (date) => new Date(date).setHours(0, 0, 0, 0);

const calculateDayDifference = (date1, date2) => 
    Math.floor((date1 - date2) / (1000 * 60 * 60 * 24));

const getDefaultStats = () => ({
    current: 0,
    longest: 0,
    consecutiveFailedDays: 0,
    lastCompletedDate: null
});

exports.update = async (userId, activity, date) => {
  try {
    const streak = await Streak.findOne({ userId, activity });

    const today = normalizeDate(data);

    if (!streak) {
      // Create a new streak if none exists
      return await Streak.create({
        userId,
        activity,
        date: today,
        current: 1,
        longest: 1,
        lastCompletedDate: today,
        streakPeriods: [
          { startDate: today, endDate: today, duration: 1, broken: false },
        ],
      });
    }

    const lastDate = normalizeDate(streak.lastCompletedDate);

    const diffDays = calculateDayDifference(today - lastDate);

    if (diffDays === 1) {
      // Continue streak
      streak.current += 1;
      streak.longest = Math.max(streak.longest, streak.current);
      streak.lastCompletedDate = today;

      // Update streak periods
      const lastPeriod = streak.streakPeriods[streak.streakPeriods.length - 1];
      lastPeriod.endDate = today;
      lastPeriod.duration += 1;

    } else if (diffDays > 1) {
      // Break streak
      streak.consecutiveFailedDays += diffDays - 1;
      streak.current = 1;
      streak.lastCompletedDate = today;

      // Add a new streak period
      streak.streakPeriods.push({
        startDate: today,
        endDate: today,
        duration: 1,
        broken: true,
        reason: `Missed ${diffDays - 1} days.`,
      });
    }

    // Update statistics
    streak.statistics = {
      averageStreak:
        streak.streakPeriods.reduce((sum, period) => sum + period.duration, 0) /
        streak.streakPeriods.length,
      totalDaysCompleted: streak.streakPeriods.reduce(
        (sum, period) => sum + period.duration,
        0
      ),
      completionRate:
        (streak.streakPeriods.reduce(
          (sum, period) => sum + period.duration,
          0
        ) /
          (new Date() - streak.streakPeriods[0].startDate)) *
        100,
    };

    await streak.save();
    return streak;
  } catch (error) {
    console.error("Error updating streak:", error);
    throw error;
  }
};

exports.getStreakStat = async (userId, activity) => {
  try {
    const streak = await Streak.findOne({ userId, activity });
    if (!streak) return getDefaultStats();

    return streak.statistics;
  } catch (error) {
    console.error("Error fetching streak statistics:", error);
    throw error;
  }
};

exports.getAllStreaks = async (userId) => {
  try {
    return await Streak.find({ userId });
  } catch (error) {
    console.error("Error fetching all streaks:", error);
    throw error;
  }
};
