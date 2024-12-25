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
    try{
        const weightInKg = weightUnit === 'lbs' ? convertWeight(weight, 'lbs', 'kg') : weight;
    const heightInM = heightUnit === 'cm' ? convertHeight(height, 'cm', 'm') : convertHeight(height, 'ft', 'm');
    if (weightInKg <= 0 || heightInM <= 0) throw new Error('Invalid weight or height values.');

    const bmiValue = weightInKg / (heightInM ** 2);
    return { value: bmiValue, category: calculateBMICategory(bmiValue) };
    }catch(error) {
        console.log('Error during calcualte BMI', error);
    }
};


const calculateAnalysis = async (userId) => {
    try{
        const weight = await Weight.findOne({userId});
        if(!weight?.weightEntries.length) throw new Error('No weight entries found.');

        const sortedEntries = [...weight.weightEntries].sort((a,b) => a.date - b.date);
        const start = sortedEntries[0].value;
        const end = sortedEntries[sortedEntries.length-1].value;
        const totalChange = end-start;
        const changePercentage = (totalChange / start) * 100;

        const now = new Date();
        const oneWeekAgo = new Date(now - 7*24*60*60*1000);
        const oneMonthAgo = new Date(now - 30*24*60*60*1000);

        const calculateTrend = (entries) => 
            entries.length > 1
                ? (entries[entries.length -1].value - entries[0].value)
                : 0;

        weight.analytics = {
            weightProgress: {
                start,
                end,
                totalChange,
                changePercentage
            },
            weightTrend: {
                weekly: calculateTrend(sortedEntries.filter(entry => entry.date >= oneWeekAgo)),
                monthly: calculateTrend(sortedEntries.filter(entry => entry.date >= oneMonthAgo))
            },
            latestBmi:  weight.analytics.bmiHistory?.[weight.analytics.bmiHistory.length-1] || null
        };
        await weight.save();
        
        return weight.analytics;
    }catch(error) {
        console.error("Error calculate Analysis water record:", error);
        res.status(500).json({ msg: "Server error during water analysis." });
    }
}

exports.createWeight = async (req, res) => {
    try {
        const {userId, weightEntries} = req.body;
        const user = await User.findById(userId);
        if (!user || !user.physicalMetrics?.height) {
            return res.status(400).json({ msg: 'User height data not found.' });
        }
        let weight = await Weight.findOne({userId});
        if (!weight) {
            weight = new Weight({userId, weightEntries: []});
        }
        const bmiResult = calculateBMI(weightEntries.value, user.physicalMetrics.height.value, weightEntries.unit, user.physicalMetrics.height.unit);
        weight.analytics.bmiHistory = weight.analytics.bmiHistory || [];
            weight.analytics.bmiHistory.push({
                ...bmiResult,
                date: weightEntries.date || new Date()
            });
        weight.weightEntries.push(weightEntries);
        await calculateAnalysis(userId);
        await weight.save();
        return res.status(201).json({weight, msg: "Weight created!"});
    }catch(error) {
        console.error("Error creating water record:", error);
        res.status(500).json({ msg: "Server error during water record creation." });
    }
};

exports.getWeight = async (req, res) => {
    try{
        const userId = req.user._id;
        const weight = await Weight.findOne({userId});
        if(!weight)
            return res.status(404).json({msg: 'Weight data not found.'});
        res.status(200).json({weight, msg:"Weight retrived!"});
    }catch(error) {
        console.error("Error retriving water record:", error);
        res.status(500).json({ msg: "Server error during water record retrival." });
    }
};

exports.updateWeight = async (req, res) => {
    try{
        const {id} = req.params;
        const userId = req.user._id;
        const updates = req.body;

       const weight = await Weight.findOne({userId});
        if(!weight)
            return res.status(404).json({msg: 'Weight data not found.'});
        const index = weight.weightEntries.findIndex(
            entry => entry._id.toString() === id
        );
        if (index === -1)
            return res.status(404).json({msg:'Weight entry not found'});

        weight.weightEntries[index] = {
            ...weight.weightEntries[index].toObject(),
            ...updates
        };

        await weight.save();
        await calculateAnalysis(userId);

        res.status(200).json({weight, msg: "Weight updated!"});
    }catch(error) {
        console.error("Error updating water record:", error);
        res.status(500).json({ msg: "Server error during water record updated." });
    }
};

exports.deleteWeight = async (req, res) => {
    try{
        const {id} = req.params;
        const userId= req.user._id;
        const weight = await Weight.findOneAndUpdate({userId}, {$pull: {weightEntries: {_id: id}}}, {new: true});
        if(!weight)
            return res.status(404).json({msg: 'Weight data not found.'});
        await calculateAnalysis(userId);
        res.status(200).json({msg: "Weight deleted!"});
    }catch(error) {
        console.error("Error deleting water record:", error);
        res.status(500).json({ msg: "Server error during water record detele." });
    }
};
