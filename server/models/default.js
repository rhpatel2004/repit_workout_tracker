const mongoose = require('mongoose');

const defaultWorkoutSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, required: true },
    workoutName: { type: String, required: true },
    exercises: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Exercise' }] // Array of exercise ObjectIds
});

const DefaultWorkout = mongoose.model('DefaultWorkout', defaultWorkoutSchema);

module.exports = DefaultWorkout;