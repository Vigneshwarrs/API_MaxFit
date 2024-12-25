const Sleep = require('../models/sleepSchema');

exports.createSleep = async (req, res) => {
    try{
        const { bedTime, wakeTime, duration, quality, mood, notes} = req.body;
        const userId = req.user._id;
        const date = new Date(req.body.date || Date.now()).setHours(0,0,0,0);
        if(!bedTime || !wakeTime || !quality || !mood)
            return res.status(400).json({msg: "All required fields must be provided."});

        let sleep = await Sleep.findOne({userId, date});

        if(sleep) {
            Object.assign(sleep, {
                bedTime: new Date(bedTime),
                wakeTime: new Date(wakeTime),
                duration,
                quality,
                mood,
                notes: notes || sleep.notes
            });
        }else {
            sleep = new Sleep({
                userId,
                date,
                wakeTime: new Date(wakeTime),
                bedTime: new Date(bedTime),
                duration,
                quality,
                mood,
                notes
            });

            await sleep.save();
            return res.status(200).json({sleep, msg: `Sleep record ${sleep? 'updated' : 'created'}  successfully!`});
        }
    }catch(err){
        console.log(`Error creating sleep, ${err}`);
        res.status(500).json({msg: "Server error during sleep creation!"});
    }
};

exports.getSleepByDate = async (req, res) => {
    try{
        const date = new Date(req.params.date).setHours(0,0,0,0);
        const sleep = await Sleep.findOne({userId: req.user._id, date});
        if(!sleep) 
            return res.status(404).json({ msg: "No sleep records found for this date." });
        res.status(200).json({sleep, msg: "Sleep records retrieved successfully!"});
    }catch(err){
        console.log(`Error retriving sleep, ${err}`);
        res.status(500).json({msg: "Server error during sleep retrival!"});
    }
};

exports.getSleepById = async (req, res) => {
    try{
        const id = req.params.id;
        const sleep = await Sleep.findById(id);
        if(!sleep)
            return res.status(404).json({ msg: "No sleep records found." });
        res.status(200).json({sleep, msg: "Sleep records retrieved successfully!"});
    }catch(err) {
        console.log(`Error retriving sleep, ${err}`);
        res.status(500).json({msg: "Server error during sleep retrival!"});
    }
};

exports.updateSleep = async (req, res) => {
    try {
        const updates = { ...req.body };
        const updatedSleep = await Sleep.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            { $set: updates },
            { new: true, runValidators: true }
        );
        if (!updatedSleep) {
            return res.status(404).json({ msg: "Sleep record not found." });
        }
        res.status(200).json({ updatedSleep, msg: "Sleep record updated successfully!" });
    } catch (error) {
        console.error("Error updating sleep record:", error);
        res.status(500).json({ msg: "Server error during sleep record update." });
    }
};

exports.deleteSleep = async (req, res) => {
    try {
        const deletedSleep = await Sleep.findOneAndDelete({
            _id: req.params.id,
            userId: req.user._id,
        });
        if (!deletedSleep) {
            return res.status(404).json({ msg: "Sleep record not found." });
        }
        res.status(200).json({ msg: "Sleep record deleted successfully!" });
    } catch (error) {
        console.error("Error deleting sleep record:", error);
        res.status(500).json({ msg: "Server error during sleep record deletion." });
    }
};

exports.getMoodInsights = async (req, res) => {
    try {
        const sleep = await Sleep.findOne({ _id: req.params.id, userId: req.user._id });
        if (!sleep) {
            return res.status(404).json({ msg: "Sleep record not found." });
        }

        const moodInsights = await sleep.getMoodInsights();
        res.status(200).json({ moodInsights, msg: "Mood insights retrieved successfully!" });
    } catch (error) {
        console.error("Error retrieving mood insights:", error);
        res.status(500).json({ msg: "Server error during mood insights retrieval." });
    }
};

exports.getSleepStatistics = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const userId = req.user._id;

        const statistics = await Sleep.aggregate([
            {
                $match: {
                    userId,
                    date: {
                        $gte: new Date(startDate),
                        $lte: new Date(endDate)
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    totalRecords: { $sum: 1 },
                    avgDuration: { $avg: "$duration" },
                    avgQuality: { $avg: "$quality" },
                    avgBedTime: {
                        $avg: {
                            $add: [
                                { $hour: "$bedTime" },
                                { $divide: [{ $minute: "$bedTime" }, 60] }
                            ]
                        }
                    },
                    avgWakeTime: {
                        $avg: {
                            $add: [
                                { $hour: "$wakeTime" },
                                { $divide: [{ $minute: "$wakeTime" }, 60] }
                            ]
                        }
                    },
                    moodDistribution: {
                        $push: "$mood"
                    },
                    qualityByMood: {
                        $push: {
                            k: "$mood",
                            v: "$quality"
                        }
                    }
                }
            }
        ]);

        if (!statistics.length) {
            return res.status(404).json({ msg: "No sleep records found for this period." });
        }

        const stats = statistics[0];
        
        // Process mood distribution
        const moodCounts = stats.moodDistribution.reduce((acc, mood) => {
            acc[mood] = (acc[mood] || 0) + 1;
            return acc;
        }, {});

        // Calculate average quality per mood
        const qualityByMood = stats.qualityByMood.reduce((acc, { k, v }) => {
            if (!acc[k]) acc[k] = { total: 0, count: 0 };
            acc[k].total += v;
            acc[k].count += 1;
            return acc;
        }, {});

        const averageQualityByMood = Object.entries(qualityByMood).reduce((acc, [mood, data]) => {
            acc[mood] = data.total / data.count;
            return acc;
        }, {});

        // Convert hours back to formatted time
        const formatTime = (hours) => {
            const h = Math.floor(hours);
            const m = Math.round((hours - h) * 60);
            return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
        };

        const response = {
            totalRecords: stats.totalRecords,
            averages: {
                duration: Number(stats.avgDuration.toFixed(2)),
                quality: Number(stats.avgQuality.toFixed(2)),
                bedTime: formatTime(stats.avgBedTime),
                wakeTime: formatTime(stats.avgWakeTime)
            },
            moodDistribution: moodCounts,
            qualityByMood: averageQualityByMood,
            insights: await generateInsights({
                avgQuality: stats.avgQuality,
                avgDuration: stats.avgDuration,
                moodCounts,
                qualityByMood: averageQualityByMood
            }),
            msg: "Sleep statistics retrieved successfully!"
        };

        res.status(200).json(response);
    } catch (error) {
        console.error("Error retrieving sleep statistics:", error);
        res.status(500).json({ msg: "Server error during sleep statistics retrieval." });
    }
};

async function generateInsights(data) {
    const insights = [];

    // Duration insights
    if (data.avgDuration < 7) {
        insights.push({
            type: 'warning',
            message: 'Your average sleep duration is below the recommended 7-9 hours.',
            suggestion: 'Try to gradually adjust your schedule to get more sleep.'
        });
    }

    // Quality insights
    if (data.avgQuality < 6) {
        insights.push({
            type: 'improvement',
            message: 'Your sleep quality could be improved.',
            suggestion: 'Consider creating a consistent bedtime routine and optimizing your sleep environment.'
        });
    }

    // Mood pattern insights
    const totalMoods = Object.values(data.moodCounts).reduce((a, b) => a + b, 0);
    const negativeMoodRatio = Object.entries(data.moodCounts)
        .filter(([mood]) => moodCategories.negative.includes(mood))
        .reduce((sum, [_, count]) => sum + count, 0) / totalMoods;

    if (negativeMoodRatio > 0.4) {
        insights.push({
            type: 'alert',
            message: 'You\'re experiencing frequent negative moods after sleep.',
            suggestion: 'Consider consulting a sleep specialist to identify potential sleep issues.'
        });
    }

    return insights;
}