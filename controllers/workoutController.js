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
    const { type, exercises: exerciseInputs, notes, date } = req.body;
    const userId = req.user._id;

    const { start, end } = getStartAndEndOfDay(date);
    let workout = await Workout.findOne({
      userId,
      date: { $gte: start, $lte: end },
    });
    const processedExercises = await Promise.all(
      exerciseInputs.map(
        async ({
          name,
          exerciseType,
          caloriesBurnedPerUnit,
          description,
          duration,
          sets,
          reps,
          intensity,
        }) => {
          let exercise = await Exercise.findOne({ name, type: exerciseType });
          if (!exercise) {
            exercise = new Exercise({
              name,
              type: exerciseType,
              caloriesBurnedPerUnit,
              description,
            });
            await exercise.save();
          }

          return {
            exerciseId: exercise._id,
            duration,
            sets,
            reps,
            caloriesBurned: calculateCaloriesBurned(
              exercise,
              duration,
              sets,
              reps
            ),
            intensity,
          };
        }
      )
    );
    if (!workout) {
      workout = new Workout({
        userId,
        type,
        exercises: processedExercises,
        notes: notes || {},
        date: date || new Date(),
      });
    } else {
      // Update existing workout's exercises
      processedExercises.forEach((newExercise) => {
        const existingIndex = workout.exercises.findIndex(
          (e) => e.exerciseId.toString() === newExercise.exerciseId.toString()
        );
        if (existingIndex === -1) {
          workout.exercises.push(newExercise);
        } else {
          workout.exercises[existingIndex] = {
            ...workout.exercises[existingIndex].toObject(),
            ...newExercise,
          };
        }
      });

      // Update other fields if provided
      if (type) workout.type = type;
      if (notes) workout.notes = { ...workout.notes, ...notes };
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
    const { startDate, endDate, type, intensity } = req.query;
    const query = { userId: req.user._id };
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    if (type) {
      query.type = type;
    }
    const workouts = await Workout.find(query)
      .populate({
        path: "exercises.exerciseId",
        select: "name type caloriesPerUnit description",
      })
      .sort({ date: -1 });
    if (intensity) {
      workouts = workouts.filter((workout) =>
        workout.exercises.some((exercise) => exercise.intensity === intensity)
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
  try {
    const { type, exercises, notes } = req.body;
    const { id } = req.params;
    const userId = req.user._id;
    const workout = await Workout.findOne({ id, userId });
    if (!workout) return res.status(400).json({ msg: "Workout not found!" });
    if (type) workout.type = type;
    if (notes) workout.notes = { ...workout.notes, ...notes };
    if (exercises) {
      for (const exercise of exercises) {
        const index = workout.exercises.findIndex(
          (e) => e._id.toString() === exercise._id
        );
        if (index !== -1) {
          workout.exercises[index] = {
            ...workout.exercises[index].toObject(),
            ...exercise,
          };
        }
      }
    }
    await workout.save();

    const updatedWorkout = await Workout.findById(id).populate({
      path: "exercises.exerciseId",
      select: "name type caloriesPerUnit description",
    });

    res
      .status(200)
      .json({ workout: updatedWorkout, msg: "Workout updated successfully!" });
  } catch (err) {
    console.log(`Error during update workout. Error is ${err}`);
    res.status(500).json({ msg: "Server error during updation" });
  }
};
exports.deleteWorkout = async (req, res) => {
  try {
    const { id } = req.params;
    const workout = await Workout.findByIdAndDelete(id);

    if (!workout) {
      return res.status(404).json({ message: "Workout not found" });
    }

    res.status(200).json({
      msg: "Workout deleted successfully!",
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
      path: "exercises.exerciseId",
      select: "name type caloriesBurnedPerUnit",
    });

    const stats = {
      totalWorkouts: workouts.length,
      totalCaloriesBurned: 0,
      workoutsByType: {},
      exercisesByIntensity: {
        low: 0,
        moderate: 0,
        high: 0,
      },
      averageEnergyLevel: 0,
      averageDifficultyLevel: 0,
      mostPopularExercises: {},
      averageWorkoutDuration: 0,
    };

    workouts.forEach((workout) => {
      // Track workout types
      if (!stats.workoutsByType[workout.type]) {
        stats.workoutsByType[workout.type] = 0;
      }
      stats.workoutsByType[workout.type]++;

      // Track exercise stats
      workout.exercises.forEach((exercise) => {
        // Calories and duration
        stats.totalCaloriesBurned += exercise.caloriesBurned || 0;
        stats.averageWorkoutDuration += exercise.duration || 0;

        // Intensity tracking
        stats.exercisesByIntensity[exercise.intensity]++;

        // Popular exercises
        const exerciseName = exercise.exerciseId.name;
        if (!stats.mostPopularExercises[exerciseName]) {
          stats.mostPopularExercises[exerciseName] = 0;
        }
        stats.mostPopularExercises[exerciseName]++;
      });

      // Track energy and difficulty levels
      if (workout.notes) {
        stats.averageEnergyLevel += workout.notes.energyLevel || 0;
        stats.averageDifficultyLevel += workout.notes.difficultyLevel || 0;
      }
    });

    // Calculate averages
    if (workouts.length > 0) {
      stats.averageWorkoutDuration /= workouts.length;
      stats.averageCaloriesPerWorkout =
        stats.totalCaloriesBurned / workouts.length;
      stats.averageEnergyLevel /= workouts.length;
      stats.averageDifficultyLevel /= workouts.length;
    }

    // Sort most popular exercises
    stats.mostPopularExercises = Object.entries(stats.mostPopularExercises)
      .sort(([, a], [, b]) => b - a)
      .reduce((r, [k, v]) => ({ ...r, [k]: v }), {});

    res.status(200).json({
      stats,
      msg: "Workout statistics retrieved successfully!",
    });
  } catch (err) {
    console.log(`Error retrieving workout statistics ${err}`);
    res.status(500).json({ msg: "Server error during Retrival" });
  }
};
