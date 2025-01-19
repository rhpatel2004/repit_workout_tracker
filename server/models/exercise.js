const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const exerciseSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  muscleGroup: {
    type: String,
    required: true
  },
  equipment: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String
  },
  videoUrl: {
    type: String
  },
  category: {
    type: String,
    required: true,
    enum: ['strength', 'cardio', 'bodyweight']
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User' // Assuming your User model is named 'User'
  },
  trainerId: {
    type: Schema.Types.ObjectId,
    ref: 'User' // Assuming your User model is named 'User'
  }
}, { timestamps: true }); // Automatically adds createdAt and updatedAt

const Exercise = mongoose.model('Exercise', exerciseSchema);

module.exports = Exercise;