const mongoose = require("mongoose");

const workoutSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    workoutName: { type: String, required: true },
    workoutNote: { type: String },
    date: { type: Date, required: true },
    exercises: [
        {
            name: { type: String, required: true },
            sets: [
                {
                    setNumber: { type: Number, required: true },
                    reps: { type: Number, required: true },
                    weight: { type: Number, required: true }
                }
            ]
        }
    ]
});


const Workout = mongoose.model("Workout", workoutSchema);
module.exports = Workout;


