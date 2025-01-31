  const mongoose = require("mongoose");
  const Schema = mongoose.Schema;

  const completedWorkoutSchema = new Schema(
    {
      userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
      workoutTemplateId: {
        type: Schema.Types.ObjectId,
        ref: "WorkoutTemplate",
        default: null,
      }, // Optional, for template-based workouts
      name: { type: String, required: true },
      date: { type: Date, required: true },
      duration: { type: Number }, // Optional, for total workout duration
      notes: { type: String }, // Optional, for user notes
      exercises: [
        {
          exerciseId: { type: Schema.Types.ObjectId, ref: "Exercise" },
          sets: [
            {
              reps: { type: Number }, // Required for strength exercises
              weight: { type: Number }, // Required for strength exercises
              duration: { type: Number }, // Required for cardio exercises
              restTime: { type: Number }, // Optional, for rest between sets
            },
          ],
        },
      ],
      isTemplate: { type: Boolean, default: false },
    },
    { timestamps: true }
  );

  const CompletedWorkout = mongoose.model(
    "CompletedWorkout",
    completedWorkoutSchema
  );
  module.exports = CompletedWorkout;