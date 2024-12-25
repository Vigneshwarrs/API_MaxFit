const Goal = require('../models/goalSchema');

const fetchGoal = async (id, userId) => {
    return Goal.findOne({ _id: id, userId });
};

exports.createGoal = async (req, res) => {
    try {
        const goal = new Goal({ ...req.body, userId: req.user._id });
        await goal.save();
        res.status(201).json({ goal, msg: "Goal created successfully!" });
    } catch (err) {
        console.error("Error creating goal:", err);
        res.status(500).json({ msg: "Server error during goal creation." });
    }
};

exports.getGoals = async (req, res) => {
    try {
        const goals = await Goal.find({ userId: req.user._id });
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
        res.status(200).json({ goal, msg: "Goal retrieved successfully!" });
    } catch (err) {
        console.error("Error retrieving goal by ID:", err);
        res.status(500).json({ msg: "Server error during goal retrieval." });
    }
};

exports.updateGoal = async (req, res) => {
    try {
        const updates = { ...req.body };
        const updatedGoal = await Goal.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            { $set: updates },
            { new: true, runValidators: true }
        );
        if (!updatedGoal) return res.status(404).json({ msg: "Goal not found." });
        res.status(200).json({ updatedGoal, msg: "Goal updated successfully!" });
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

exports.updateProgress = async (req, res) => {
    try {
        const goal = await fetchGoal(req.params.id, req.user._id);
        if (!goal) return res.status(404).json({ msg: "Goal not found." });

        goal.progress = req.body.progress;
        if (goal.autoUpdateStreak) {
            await goal.calculateStreak();
        }

        await goal.save();
        res.status(200).json({ goal, msg: "Progress updated successfully!" });
    } catch (err) {
        console.error("Error updating progress:", err);
        res.status(500).json({ msg: "Server error during progress update." });
    }
};
