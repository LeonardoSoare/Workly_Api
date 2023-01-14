import express, { json } from "express";
import { initialize } from "./repository.mjs";
import routes from "./routes.mjs";

const app = express();
app.use(json());
app.use("/api/workouts", routes);

app.listen(8080, async () => {
  try {
    await initialize();
    console.log("Server running on port 8080");
  } catch (err) {
    console.error(err);
  }
});
