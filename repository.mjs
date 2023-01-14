import Sequelize from "sequelize";

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "./workouts.db",
});

const Workout = sequelize.define("workout", {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    allowNull: false,
    primaryKey: true,
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  focus: {
    type: Sequelize.STRING,
    allowNull: true,
  },
});

const Exercise = sequelize.define("exercise", {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    allowNull: false,
    primaryKey: true,
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false,
  },
});

const Set = sequelize.define("set", {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    allowNull: false,
    primaryKey: true,
  },
  weight: {
    type: Sequelize.NUMBER,
    allowNull: false,
  },
  reps: {
    type: Sequelize.NUMBER,
    allowNull: false,
  },
  min: {
    type: Sequelize.NUMBER,
    allowNull: false,
  },
  sec: {
    type: Sequelize.NUMBER,
    allowNull: false,
  },
});

Workout.hasMany(Exercise, { foreignKey: "workoutId" });
Exercise.belongsTo(Workout, { foreignKey: "workoutId" });

Exercise.hasMany(Set, { foreignKey: "exerciseId" });
Set.belongsTo(Exercise, { foreignKey: "exerciseId" });

async function initialize() {
  await sequelize.authenticate();
  await sequelize.sync();
}

export { initialize, Workout, Exercise, Set };
