const Water = require('../models/waterSchema');

exports.createOrUpdateWater = async (req, res) => {
    try{
        const { dailyGoal, intakeEntries} =req.body;
        const userId = req.user._id;
        const date = new Date(req.body.date || Date.now).setHours(0,0,0,0);
        let water = await Water.findOne({userId, date});
        if(water) {
            if(dailyGoal)
                water.dailyGoal = dailyGoal;
            if(intakeEntries)
                water.intakeEntries.push(...intakeEntries);
        }else {
            water = new Water({
                userId,
                date,
                dailyGoal,
                intakeEntries
            });
        }
        await updateDailyStats(water);

        await water.save();
        res.status(200).json({water, msg:"Water record created/updated successully!"});
    }catch(err) {
        console.log(`Error creation water ${err}`);
        res.status(500).json({msg: "Server error during water creation!"});
    }
};
exports.getWaterByDate = async (req, res) => {
    try {
        const userId = req.user._id;
        const date = new Date(req.params.date).setHours(0, 0, 0, 0);

        const waterRecord = await Water.findOne({ userId, date });

        if (!waterRecord) {
            return res.status(404).json({ msg: "No water record found for this date." });
        }

        res.status(200).json({ waterRecord, msg: "Water record retrieved successfully!" });
    } catch (error) {
        console.error("Error retrieving water record by date:", error);
        res.status(500).json({ msg: "Server error during water record retrieval." });
    }
};

exports.deleteWaterRecord = async (req, res) => {
    try {
        const userId = req.user._id;
        const waterRecord = await Water.findOneAndDelete({ _id: req.params.id, userId });

        if (!waterRecord) {
            return res.status(404).json({ msg: "Water record not found." });
        }

        res.status(200).json({ msg: "Water record deleted successfully!" });
    } catch (error) {
        console.error("Error deleting water record:", error);
        res.status(500).json({ msg: "Server error during water record deletion." });
    }
};

exports.getWaterHistory = async (req, res) => {
    try {
        const { startDate, endDate, forChart = false } = req.body;

        const userId = req.user._id;
        const waterHistory = await Water.find({
            userId,
            date: { $gte: new Date(startDate), $lte: new Date(endDate) },
        }).sort({ date: 1 });

        if (!waterHistory.length) {
            return res.status(404).json({ msg: "No water records found for this period." });
        }

        // For chart: Aggregate and format data
        if (forChart) {
            const chartData = waterHistory.map((record) => ({
                date: record.date.toISOString().split("T")[0],
                totalIntake: record.dailyStats.totalIntake,
                goalAchieved: record.dailyStats.goalAchieved,
                completionPercentage: record.dailyStats.completionPercentage,
            }));

            return res.status(200).json({ chartData, msg: "Water history formatted for chart." });
        }

        res.status(200).json({ waterHistory, msg: "Water history retrieved successfully!" });
    } catch (error) {
        console.error("Error retrieving water history:", error);
        res.status(500).json({ msg: "Server error during water history retrieval." });
    }
};

const updateDailyStats = async (waterRecord) => {
    const { intakeEntries, dailyGoal } = waterRecord;

    // Convert intake amounts to the same unit as dailyGoal
    const unitConversion = {
        ml: 1,
        l: 1000,
        oz: 29.5735,
    };

    const goalInMl = dailyGoal.amount * unitConversion[dailyGoal.unit];
    let totalIntake = 0;

    intakeEntries.forEach((entry) => {
        totalIntake += entry.amount * unitConversion[entry.unit];
    });

    // Update daily stats
    waterRecord.dailyStats.totalIntake = totalIntake;
    waterRecord.dailyStats.goalAchieved = totalIntake >= goalInMl;
    waterRecord.dailyStats.completionPercentage = Math.min(
        (totalIntake / goalInMl) * 100,
        100
    );
    waterRecord.dailyStats.totalEntries = intakeEntries.length;
};
