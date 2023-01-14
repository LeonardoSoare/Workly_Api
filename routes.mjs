import express from "express";
import { Workout, Exercise, Set } from "./repository.mjs";
import {
  getWorkouts,
  postWorkout,
  getWorkout,
  putWorkout,
  deleteWorkout,
} from "./handlers.mjs";

const router = express.Router();

router.route("/").get(getWorkouts).post(postWorkout);

router.route("/:id").get(getWorkout).put(putWorkout).delete(deleteWorkout);

export default router;
