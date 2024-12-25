const Exercise = require('../models/exerciseSchema');


exports.createExercise = async (req, res) => {
    try{
        const {name, type, caloriesBurnedPerUnit, description} = req.body;
        const exercise = new Exercise({name, type, caloriesBurnedPerUnit, description});
        await exercise.save();

        res.status(201).json({exercise, msg: "Exercise create successfuly!"});
    }catch(err) {
        res.status(500).json({ msg: `Server error during create exercise. Error is ${err}` });
    }
};

exports.getExercises = async (req, res) => {
    try{
        const exercises = await Exercise.find();

        res.status(200).json({exercises, msg: "Exercises retrived!"})
    }catch(err) {
        res.status(500).json({ msg: `Server error during get exercise. Error is ${err}` });
    }
}

exports.getExerciseById = async (req, res) => {
    try{
        const {id} = req.params;
        const exercise = await Exercise.findById(id);
        if (!exercise) return res.status(404).json({ msg: "Exercise not found!" });
        res.status(200).json({exercise, msg: "Exercise retrived!"})
    }catch(err) {
        res.status(500).json({ msg: `Server error during get exercise. Error is ${err}` });
    }
}

exports.updateExercise = async (req, res) => {
    try{
        const {id} = req.params;
        const {name, type, caloriesBurnedPerUnit, description} = req.body;
        const exercise = await Exercise.findById(id);
        if (!exercise) return res.status(404).json({ msg: "Exercise not found!" });
        if(name) exercise.name = name;
        if(type) exercise.type = type;
        if(caloriesBurnedPerUnit) exercise.caloriesBurnedPerUnit =  caloriesBurnedPerUnit;
        if(description) exercise.description = description;

        await exercise.save();
        res.status(203).json({mag: "Exercise updated!"});
    }catch(err) {
        res.status(500).json({ msg: `Server error during update exercise. Error is ${err}` });
    }
};

exports.deleteExercise = async (req, res) => {
    try{
        const id = req.params;
        await Exercise.findByIdAndDelete(id);
        res.status(204).json({msg: "Exercise deleted!"});
    }catch(err) {
        res.status(500).json({ msg: `Server error during delete exercise. Error is ${err}` });
    }
};