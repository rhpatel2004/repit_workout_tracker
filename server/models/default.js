const mongoose = require('mongoose');

const defaultWorkoutSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, required: true },
    workoutName: { type: String, required: true },
    exercises: { type: [String], required: true } // Array of exercise names
});

const DefaultWorkout = mongoose.model('DefaultWorkout', defaultWorkoutSchema);

module.exports = DefaultWorkout;
