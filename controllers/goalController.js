const Goal = require('../models/goalSchema');

const fetchGoal = async (id, userId) => {
    return Goal.findOne({ _id: id, userId });
};

exports.createGoal = async (req, res) => {
    try {
        const goal = new Goal({ ...req.body, userId: req.user._id, progressPercentage: req.body.progress ? (req.body.progress / req.body.target) * 100 : 0 });
        await goal.save();
        res.status(201).json({ goal, msg: "Goal created successfully!" });
    } catch (err) {
        console.error("Error creating goal:", err);
        res.status(500).json({ msg: "Server error during goal creation." });
    }
};

exports.getGoals = async (req, res) => {
    try {
        const {category, type} = req.query;
        const query = {userId: req.user._id};
        if (category) query.category = category;
        if (type) query.type = type;
        const goals = await Goal.find(query);
        res.status(200).json({ goals, msg: "Goals retrieved successfully!" });
    } catch (err) {
        console.error("Error retrieving goals:", err);
        res.status(500).json({ msg: "Server error during goals retrieval." });
    }
};

exports.getGoalById = async (req, res) => {
    try {
        const goal = await fetchGoal(req.params.id, req.user._id);
        if (!goal) return res.status(404).json({ msg: "Goal not found." });
        const streakInfo = await goal.getStreakInfo();
        res.status(200).json({ goal,streakInfo, msg: "Goal retrieved successfully!" });
    } catch (err) {
        console.error("Error retrieving goal by ID:", err);
        res.status(500).json({ msg: "Server error during goal retrieval." });
    }
};

exports.getPrimaryGoals = async (req, res) => {
    try {
        const goals = await Goal.find({ 
            userId: req.user._id,
            type: 'primary'
        });
        res.status(200).json({ goals, msg: "Primary goals retrieved successfully!" });
    } catch (err) {
        console.error("Error retrieving primary goals:", err);
        res.status(500).json({ msg: "Server error during primary goals retrieval." });
    }
};

exports.getSecondaryGoals = async (req, res) => {
    try {
        const goals = await Goal.find({ 
            userId: req.user._id,
            type: 'secondary'
        });
        res.status(200).json({ goals, msg: "Secondary goals retrieved successfully!" });
    } catch (err) {
        console.error("Error retrieving secondary goals:", err);
        res.status(500).json({ msg: "Server error during secondary goals retrieval." });
    }
};

exports.getGoalsByCategory = async (req, res) => {
    try {
        const { category } = req.params;
        const goals = await Goal.find({ 
            userId: req.user._id,
            category 
        });

        if (!goals.length) {
            return res.status(404).json({ msg: `No goals found for category: ${category}` });
        }

        res.status(200).json({ goals, msg: "Category goals retrieved successfully!" });
    } catch (err) {
        console.error("Error retrieving goals by category:", err);
        res.status(500).json({ msg: "Server error during category goals retrieval." });
    }
};

exports.updateGoal = async (req, res) => {
    try {
        const updates = { ...req.body };
        if (updates.progress !== undefined || updates.target !== undefined) {
            const goal = await fetchGoal(req.params.id, req.user._id);
            if (!goal) return res.status(404).json({ msg: "Goal not found." });
            
            const target = updates.target || goal.target;
            const progress = updates.progress !== undefined ? updates.progress : goal.progress;
            updates.progressPercentage = (progress / target) * 100;
        }
        const updatedGoal = await Goal.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            { $set: updates },
            { new: true, runValidators: true }
        );
        const streakInfo = await updatedGoal.getStreakInfo();
        if (!updatedGoal) return res.status(404).json({ msg: "Goal not found." });
        res.status(200).json({ updatedGoal,streakInfo , msg: "Goal updated successfully!" });
    } catch (err) {
        console.error("Error updating goal:", err);
        res.status(500).json({ msg: "Server error during goal update." });
    }
};

exports.deleteGoal = async (req, res) => {
    try {
        const deletedGoal = await Goal.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
        if (!deletedGoal) return res.status(404).json({ msg: "Goal not found." });
        res.status(200).json({ msg: "Goal deleted successfully!" });
    } catch (err) {
        console.error("Error deleting goal:", err);
        res.status(500).json({ msg: "Server error during goal deletion." });
    }
};