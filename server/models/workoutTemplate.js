// models/workoutTemplate.js
const mongoose = require('mongoose');

const workoutTemplateSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false }, // User-created template: required. Trainer template: null
  trainerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false }, // Trainer-created template: required. User template: null
  folderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Folder' }, // Optional folder
  name: { type: String, required: true },
  exercises: [{
    exerciseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Exercise', required: true },
    // No sets/reps here; it's just a *reference* to the Exercise.
  }],
}, { timestamps: true });

module.exports = mongoose.model('WorkoutTemplate', workoutTemplateSchema);