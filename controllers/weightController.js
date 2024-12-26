const Weight = require('../models/weightSchema');
const User = require('../models/userSchema');

const calculateBMICategory = (bmi) => {
    if (bmi < 18.5) return 'underWeight';
    if (bmi < 25) return 'normal';
    if (bmi < 30) return 'overWeight';
    return 'obese';
};

const convertWeight = (value, fromUnit, toUnit) => {
    if (value <= 0) throw new Error('Invalid weight value.');
    if (fromUnit === toUnit) return value;
    return fromUnit === 'kg' ? value * 2.20462 : value * 0.453592;
};

const convertHeight = (value, fromUnit, toUnit) => {
    if (value <= 0) throw new Error('Invalid height value.');
    if (fromUnit === toUnit) return value;
    return fromUnit === 'cm' ? value / 100 : value / 3.281;
};

const calculateBMI = (weight, height, weightUnit = 'kg', heightUnit = 'cm') => {
    try {
        const weightInKg = weightUnit === 'lbs' ? convertWeight(weight, 'lbs', 'kg') : weight;
        const heightInM = heightUnit === 'cm' ? convertHeight(height, 'cm', 'm') : convertHeight(height, 'ft', 'm');
        
        if (weightInKg <= 0 || heightInM <= 0) {
            throw new Error('Invalid weight or height values.');
        }

        const bmiValue = +(weightInKg / (heightInM ** 2)).toFixed(2);
        return { 
            value: bmiValue, 
            category: calculateBMICategory(bmiValue),
            date: new Date()
        };
    } catch(error) {
        console.error('Error calculating BMI:', error);
        throw error;
    }
};

const determineWeightStatus = (totalChange) => {
    const threshold = 0.5; // Consider 0.5 kg/lbs as significant change
    if (Math.abs(totalChange) < threshold) return 'stable';
    return totalChange > 0 ? 'gaining' : 'losing';
};

const calculateAnalysis = async (userId) => {
    try {
        const weight = await Weight.findOne({ userId });
        if (!weight?.weightEntries?.length) {
            throw new Error('No weight entries found.');
        }

        const sortedEntries = [...weight.weightEntries].sort((a, b) => a.date - b.date);
        
        const normalizedEntries = sortedEntries.map(entry => ({
            ...entry,
            normalizedValue: entry.unit === 'lbs' ? convertWeight(entry.value, 'lbs', 'kg') : entry.value
        }));

        const start = normalizedEntries[0].normalizedValue;
        const end = normalizedEntries[normalizedEntries.length - 1].normalizedValue;
        const totalChange = +(end - start).toFixed(2);
        const changePercentage = +((totalChange / start) * 100).toFixed(2);

        const now = new Date();
        const oneWeekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
        const oneMonthAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);

        const calculateTrend = (entries) => 
            entries.length > 1
                ? +(entries[entries.length - 1].normalizedValue - entries[0].normalizedValue).toFixed(2)
                : 0;

        weight.analytics = {
            weightProgress: {
                start,
                end,
                totalChange,
                changePercentage
            },
            weightTrend: {
                status: determineWeightStatus(totalChange),
                weekly: calculateTrend(normalizedEntries.filter(entry => entry.date >= oneWeekAgo)),
                monthly: calculateTrend(normalizedEntries.filter(entry => entry.date >= oneMonthAgo))
            },
            latestBmi: weight.analytics.bmiHistory?.[weight.analytics.bmiHistory.length - 1] || null
        };

        await weight.save();
        return weight.analytics;
    } catch(error) {
        console.error("Error calculating weight analysis:", error);
        throw error;
    }
};

exports.createWeight = async (req, res) => {
    try {
        const { userId, weightEntry, goals } = req.body;
        
        const user = await User.findById(userId);
        if (!user?.physicalMetrics?.height?.value) {
            return res.status(400).json({ msg: 'User height data not found.' });
        }

        let weight = await Weight.findOne({ userId });
        if (!weight) {
            weight = new Weight({ 
                userId, 
                weightEntries: [],
                analytics: {
                    weightProgress: {},
                    bmiHistory: [],
                    weightTrend: {}
                },
                goals: goals || {}
            });
        }else if (goals) {
            weight.goals = {...weight.goals, ...goals};
        }

        const bmiResult = calculateBMI(
            weightEntry.value,
            user.physicalMetrics.height.value,
            weightEntry.unit,
            user.physicalMetrics.height.unit
        );
        weight.analytics.bmiHistory = weight.analytics.bmiHistory || [];
        weight.analytics.bmiHistory.push({...bmiResult, date: weightEntry.date || new Date()});
        weight.weightEntries.push(weightEntry);

        await calculateAnalysis(userId);
        await weight.save();

        return res.status(201).json({
            success: true,
            data: weight,
            msg: "Weight entry created successfully!"
        });
    } catch(error) {
        console.error("Error creating weight record:", error);
        return res.status(500).json({ 
            success: false,
            msg: error.message || "Server error during weight record creation." 
        });
    }
};

exports.getWeight = async (req, res) => {
    try {
        const userId = req.user._id;
        const { startDate, endDate } = req.query;

        const query = { userId };
        if (startDate || endDate) {
            query['weightEntries.date'] = {};
            if (startDate) query['weightEntries.date'].$gte = new Date(startDate);
            if (endDate) query['weightEntries.date'].$lte = new Date(endDate);
        }

        const weight = await Weight.findOne(query);
        if (!weight) {
            return res.status(404).json({ 
                success: false,
                msg: 'Weight data not found.' 
            });
        }

        return res.status(200).json({
            success: true,
            data: weight,
            msg: "Weight data retrieved successfully!"
        });
    } catch(error) {
        console.error("Error retrieving weight record:", error);
        return res.status(500).json({ 
            success: false,
            msg: error.message || "Server error during weight record retrieval."
        });
    }
};

exports.updateWeight = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;
        const {weightEntry, goals} = req.body;

        const weight = await Weight.findOne({ userId });
        if (!weight) {
            return res.status(404).json({ 
                success: false,
                msg: 'Weight data not found.' 
            });
        }

        const entryIndex = weight.weightEntries.findIndex(
            entry => entry._id.toString() === id
        );

        if (entryIndex === -1) {
            return res.status(404).json({ 
                success: false,
                msg: 'Weight entry not found' 
            });
        }

        // Update the entry while preserving existing fields
        weight.weightEntries[entryIndex] = {
            ...weight.weightEntries[entryIndex].toObject(),
            ...updates,
            date: updates.date || weight.weightEntries[entryIndex].date
        };

        if (goals) {
            weight.goals = {...weight.goals, ...goals};
        }

        await weight.save();
        await calculateAnalysis(userId);

        return res.status(200).json({
            success: true,
            data: weight,
            msg: "Weight entry updated successfully!"
        });
    } catch(error) {
        console.error("Error updating weight record:", error);
        return res.status(500).json({ 
            success: false,
            msg: error.message || "Server error during weight record update."
        });
    }
};

exports.deleteWeight = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const weight = await Weight.findOneAndUpdate(
            { userId },
            { $pull: { weightEntries: { _id: id } } },
            { new: true }
        );

        if (!weight) {
            return res.status(404).json({ 
                success: false,
                msg: 'Weight data not found.' 
            });
        }

        await calculateAnalysis(userId);

        return res.status(200).json({
            success: true,
            msg: "Weight entry deleted successfully!"
        });
    } catch(error) {
        console.error("Error deleting weight record:", error);
        return res.status(500).json({ 
            success: false,
            msg: error.message || "Server error during weight record deletion."
        });
    }
};