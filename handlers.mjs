import { response } from "express";
import sequelize, { Model } from "sequelize";
import { CLIENT_RENEG_LIMIT } from "tls";
import { Workout, Exercise, Set } from "./repository.mjs";

const createResponseData = async function (workoutId) {
  const workout = (await Workout.findByPk(workoutId)).dataValues;
  const exercises = await Exercise.findAll({ where: { workoutId: workoutId } });
  const exercisesData = exercises.map((exercise) => exercise.dataValues);
  const setsValue = await Promise.all(
    exercisesData.map(async (exercise) => {
      const sets = await Set.findAll({ where: { exerciseId: exercise.id } });
      return sets.map((set) => set.dataValues);
    })
  );
  const responseData = {
    ...workout,
    exercises: exercisesData.map((exercise, i) => {
      return { ...exercise, sets: setsValue[i] };
    }),
  };

  return responseData;
};

const postWorkout = async function (req, res) {
  try {
    let body = req.body;
    const workout = await Workout.create({
      name: body.name,
      focus: body.focus,
    });
    const exercises = body.exercises;
    exercises.forEach(async (exercise) => {
      const createdExercise = await Exercise.create({
        name: exercise.name,
        workoutId: workout.id,
      });
      exercise.sets.forEach(async (set) => {
        await Set.create({
          weight: set.weight,
          reps: set.reps,
          min: set.min,
          sec: set.sec,
          exerciseId: createdExercise.id,
        });
      });
    });
    const responseData = await createResponseData(workout.id);

    res.status(201).json({ message: "Succes", data: responseData });
  } catch (error) {
    res.status(500).json(error);
  }
};

const getWorkouts = async function (req, res) {
  try {
    const allId = await Workout.findAll();
    const responseData = await Promise.all(
      allId.map(
        async (workout) => await createResponseData(workout.dataValues.id)
      )
    );
    res.status(200).json({
      message: "Succes",
      results: responseData.length,
      data: responseData,
    });
  } catch (error) {
    res.status(500).json(error);
  }
};
const getWorkout = async function (req, res) {
  try {
    const id = req.params.id;
    const responseData = await createResponseData(id);
    res.status(200).json({ message: "Succes", data: responseData });
  } catch (error) {
    res.status(500).json(error);
  }
};
const putWorkout = async function (req, res) {
  try {
    const id = req.params.id;
    // Update Workout
    const workout = await Workout.findByPk(id);
    workout.set({
      name: req.body.name,
      focus: req.body.focus,
    });
    await workout.save();
    // Deleting Exercises and Sets
    const exercises = await Exercise.findAll({
      where: { workoutId: id },
    });
    const exercisesData = exercises.map((exercise) => exercise.dataValues);
    let sets;
    const setsValue = await Promise.all(
      exercisesData.map(async (exercise) => {
        sets = await Set.findAll({ where: { exerciseId: exercise.id } });
        return sets.map((set) => set.dataValues);
      })
    );
    sets.map(async (set) => await set.destroy());
    exercises.map(async (exercises) => await exercises.destroy());
    // Re-creating updated sets and exercises
    req.body.exercises.forEach(async (exercise) => {
      const createdExercise = await Exercise.create({
        name: exercise.name,
        workoutId: workout.id,
      });
      exercise.sets.forEach(async (set) => {
        await Set.create({
          weight: set.weight,
          reps: set.reps,
          min: set.min,
          sec: set.sec,
          exerciseId: createdExercise.id,
        });
      });
    });
    res
      .status(200)
      .json({ message: "Succes", data: await createResponseData(id) });
  } catch (error) {
    res.status(500).json(error);
  }
};
const deleteWorkout = async function (req, res) {
  try {
    const workoutId = req.params.id;
    const workout = (await Workout.findByPk(workoutId)).dataValues;
    const exercises = await Exercise.findAll({
      where: { workoutId: workoutId },
    });
    const exercisesData = exercises.map((exercise) => exercise.dataValues);
    let sets;
    const setsValue = await Promise.all(
      exercisesData.map(async (exercise) => {
        sets = await Set.findAll({ where: { exerciseId: exercise.id } });
        return sets.map((set) => set.dataValues);
      })
    );
    sets.map(async (set) => await set.destroy());
    exercises.map(async (exercises) => await exercises.destroy());
    await (await Workout.findByPk(workoutId)).destroy();
    res.status(202).json({ message: "Succes" });
  } catch (error) {
    res.status(500).json(error);
  }
};

export { postWorkout, getWorkout, getWorkouts, putWorkout, deleteWorkout };
