const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const exerciseSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  muscleGroup: { type: String }, // e.g., "Chest", "Back", "Legs"
  equipment: { type: String }, // e.g., "Barbell", "Dumbbell", "Machine"
  difficulty: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'] },
  imageUrl: { type: String },
  videoUrl: { type: String },
  isPublic: { type: Boolean, default: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  trainerId: { type: Schema.Types.ObjectId, ref: 'User' },
});

const Exercise = mongoose.model('Exercise', exerciseSchema);
module.exports = Exercise;