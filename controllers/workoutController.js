const Workout = require("../models/workoutSchema");
const Exercise = require("../models/exerciseSchema");
const Streak = require("../models/streakSchema");

const calculateCaloriesBurned = (exercise, duration, reps, sets) => {
  if (exercise.type === "Cardio") {
    return exercise.calculateCaloriesBurned * duration;
  } else {
    return exercise.calculateCaloriesBurned * reps * sets;
  }
};

const getStartAndEndOfDay = (date) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);

  const end = new Date(date);
  end.setHours(23, 59, 59, 999);

  return { start, end };
};

exports.createWorkout = async (req, res) => {
  try {
    const {
      name,
      type,
      caloriesBurnedPerUnit,
      description,
      duration,
      sets,
      reps,
      date,
    } = req.body;
    const userId = req.user._id;
    let exercise = await Exercise.findOne({ name, type });
    if (!exercise) {
      exercise = new Exercise({
        name,
        type,
        caloriesBurnedPerUnit,
        description,
      });
      await exercise.save();
    }
    const caloriesBurned = calculateCaloriesBurned(
      exercise,
      duration,
      sets,
      reps
    );

    const { start, end } = getStartAndEndOfDay(date);
    let workout = await Workout.findOne({
      userId,
      date: { $gte: start, $lte: end },
    });

    if (workout) {
      workout = new Workout({
        userId,
        exercises: [
          { exerciseId: exercise._id, duration, sets, reps, caloriesBurned },
        ],
        date,
      });
    } else {
      const existingExercise = workout.exercises.findIndex(
        (e) => e.exerciseId.toString() === exercise._id.toString()
      );
      if (existingExercise === -1) {
        workout.exercises.push({
          exerciseId: exercise._id,
          duration,
          sets,
          reps,
          caloriesBurned,
        });
      } else {
        workout.exercises[existingExercise] = {
          exerciseId: exercise._id,
          duration,
          sets,
          reps,
          caloriesBurned,
        };
      }
    };
    const streak = Streak.findOne({userId, activity: "workout", date});
    if(streak) {
        
    }
    await workout.save();

    const populatedWorkout = await Workout.findById(workout._id).populate({
      path: "exercises.exerciseId",
      select: "name type caloriesPerUnit description",
    });

    res
      .status(201)
      .json({ workout: populatedWorkout, msg: "Workout created!" });
  } catch (err) {
    console.log(`Error during create workout. Error is ${err}`);
    res.status(500).json({ msg: "Server error during creation" });
  }
};

exports.getWorkouts = async (req, res) => {
  try {
    const { startDate, endDate, type } = req.query;
    const query = { userId: req.user._id };
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    const workouts = await Workout.find(query)
      .populate({
        path: "exercises.exerciseId",
        select: "name type caloriesPerUnit description",
      })
      .sort({ date: -1 });
    if (type) {
      workouts = workouts.filter((workout) =>
        workout.exercises.some((exercise) => exercise.exerciseId.type)
      );
    }
    res.status(200).json({ workouts, msg: "Workout Retrived" });
  } catch (err) {
    console.log(`Error during get workout. Error is ${err}`);
    res.status(500).json({ msg: "Server error during retrival" });
  }
};

exports.getWorkoutById = async (req, res) => {
  try {
    const { id } = req.params;
    const workout = await Workout.findById(id).populate({
      path: "exercises.exerciseId",
      select: "name type caloriesBurnedPerUnit description",
    });
    if (!workout) {
      return res.status(400).json({ msg: "Workout not found!" });
    }
    res.status(200).json({ workout, msg: "Workout retrieved successfully!" });
  } catch (err) {
    console.log(`Error during get workout. Error is ${err}`);
    res.status(500).json({ msg: "Server error during retrival" });
  }
};

exports.updateWorkout = async (req, res) => {
    try{
        const {exercises} = req.body;
        const {id} = req.params;
        const userId = req.user._id;
        const workout = await Workout.findById(id);
        if(!workout)
            return res.status(400).json({msg: 'Workout not found!'});
        if(exercises){
            exercises.map()
        }

    }catch(err) {
    console.log(`Error during update workout. Error is ${err}`);
    res.status(500).json({ msg: "Server error during updation" });
    }
}
exports.deleteWorkout = async (req, res) => {
    try {
        const { id } = req.params;
        const workout = await Workout.findByIdAndDelete(id);

        if (!workout) {
            return res.status(404).json({ message: 'Workout not found' });
        }

        res.status(200).json({
            msg: 'Workout deleted successfully!'
        });
    } catch (error) {
        console.log(`Error during delete workout. Error is ${err}`);
        res.status(500).json({ msg: "Server error during deletion" });
    }
};
exports.getWorkoutStats = async (req, res) => {
    try {
        const { userId, startDate, endDate } = req.query;
        const query = { userId };

        if (startDate || endDate) {
            query.date = {};
            if (startDate) query.date.$gte = new Date(startDate);
            if (endDate) query.date.$lte = new Date(endDate);
        }

        const workouts = await Workout.find(query).populate({
            path: 'exercises.exerciseId',
            select: 'name type caloriesBurnedPerUnit'
        });

        const stats = {
            totalWorkouts: workouts.length,
            totalCaloriesBurned: 0,
            exercisesByType: {},
            mostPopularExercises: {},
            averageWorkoutDuration: 0
        };

        workouts.forEach(workout => {
            const workoutCalories = workout.exercises.reduce((sum, exercise) => 
                sum + exercise.caloriesBurned, 0);
            stats.totalCaloriesBurned += workoutCalories;

            workout.exercises.forEach(exercise => {
                const type = exercise.exerciseId.type;
                if (!stats.exercisesByType[type]) {
                    stats.exercisesByType[type] = 0;
                }
                stats.exercisesByType[type]++;

                const exerciseName = exercise.exerciseId.name;
                if (!stats.mostPopularExercises[exerciseName]) {
                    stats.mostPopularExercises[exerciseName] = 0;
                }
                stats.mostPopularExercises[exerciseName]++;
            });

            const workoutDuration = workout.exercises.reduce((sum, exercise) => 
                sum + (exercise.duration || 0), 0);
            stats.averageWorkoutDuration += workoutDuration;
        });

        if (workouts.length > 0) {
            stats.averageWorkoutDuration /= workouts.length;
            stats.averageCaloriesPerWorkout = stats.totalCaloriesBurned / workouts.length;
        }

        stats.mostPopularExercises = Object.entries(stats.mostPopularExercises)
            .sort(([,a], [,b]) => b - a)
            .reduce((r, [k, v]) => ({ ...r, [k]: v }), {});

        res.status(200).json({
            stats,
            msg: 'Workout statistics retrieved successfully!'
        });
    } catch (err) {
    console.log(`Error retrieving workout statistics ${err}`);
    res.status(500).json({ msg: "Server error during Retrival" });
    }
};