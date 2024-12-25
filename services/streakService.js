const Streak = require('../models/streakSchema');

const normalizeDate = (date) => new Date(date).setHours(0, 0, 0, 0);

const createNewStreak = (userId, activity, normalizedDate) => ({
    userId,
    activity,
    date: normalizedDate,
    current: 1,
    longest: 1,
    lastCompletedDate: normalizedDate,
    consecutiveFailedDays: 0
});

const handleFailedStreak = async (streak) => {
    if (!streak) return null;
    
    streak.consecutiveFailedDays++;
    if (streak.consecutiveFailedDays > 2) {
        streak.current = 0;
    }
    await streak.save();
    return streak;
};

const calculateDayDifference = (date1, date2) => 
    Math.floor((date1 - date2) / (1000 * 60 * 60 * 24));

const updateSuccessfulStreak = async (streak, normalizedDate) => {
    const lastDate = normalizeDate(streak.lastCompletedDate);
    const dayDifference = calculateDayDifference(normalizedDate, lastDate);

    if (dayDifference === 1) {
        streak.current += 1;
        streak.longest = Math.max(streak.current, streak.longest);
    } else if (dayDifference > 1) {
        streak.current = 1;
    }
    
    streak.consecutiveFailedDays = 0;
    streak.lastCompletedDate = normalizedDate;
    
    await streak.save();
    return streak;
};

exports.update = async (userId, activity, isCompleted, date = new Date()) => {
    try {
        const normalizedDate = normalizeDate(date);
        let streak = await Streak.findOne({ userId, activity });

        if (!isCompleted) {
            return handleFailedStreak(streak);
        }

        if (!streak) {
            streak = new Streak(createNewStreak(userId, activity, normalizedDate));
            await streak.save();
            return streak;
        }

        return updateSuccessfulStreak(streak, normalizedDate);
    } catch (err) {
        console.error("Error updating streak:", err);
        throw err;
    }
};

const getDefaultStats = () => ({
    current: 0,
    longest: 0,
    consecutiveFailedDays: 0,
    lastCompletedDate: null
});

const checkAndUpdateMissedDays = async (streak) => {
    const today = normalizeDate(new Date());
    const lastDate = normalizeDate(streak.lastCompletedDate);
    const dayDifference = calculateDayDifference(today, lastDate);

    if (dayDifference > 1) {
        streak.current = 0;
        streak.consecutiveFailedDays += dayDifference - 1;
        await streak.save();
    }

    return {
        current: streak.current,
        longest: streak.longest,
        consecutiveFailedDays: streak.consecutiveFailedDays,
        lastCompletedDate: streak.lastCompletedDate
    };
};

exports.getStreakStat = async (userId, activity) => {
    try {
        const streak = await Streak.findOne({ userId, activity });
        if (!streak) return getDefaultStats();
        return checkAndUpdateMissedDays(streak);
    } catch (err) {
        console.error("Error getting streak stats:", err);
        throw err;
    }
};