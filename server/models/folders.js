// models/folder.js
const mongoose = require('mongoose');

const folderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false }, // Regular user's folder: required. Trainer's folder: null
  trainerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false }, // Trainer's folder: required.  User's folder: null.
  name: { type: String, required: true },
  isDefaultTrainerFolder: { type: Boolean, required: true, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Folder', folderSchema);