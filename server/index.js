// index.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const User = require("./models/user");
const Workout = require("./models/workout");
const DefaultWorkout = require('./models/default');
const Exercise = require('./models/Exercise');

const app = express();
app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/GymRats", { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.error("MongoDB connection error:", err));

// Import router
const router = express.Router();
app.use('/api', router); // Use '/api' as the base URL for your API routes



// Route to register a new user
app.post("/register", (req, res) => {
    const { name, email, password } = req.body;
    User.create({ name, email, password })
        .then(user => res.json(user))
        .catch(err => res.status(400).json(err));
});

// Route for login
router.post("/", (req, res) => {
    const { email, password } = req.body;
    User.findOne({ email })
        .then(user => {
            if (!user) return res.status(404).json("User not found");
            if (user.password !== password) return res.status(400).json("Incorrect password");
            res.json({ message: "Success", userId: user._id });
        })
        .catch(err => res.status(500).json(err));
});

// Route to save workout
router.post("/saveWorkout", (req, res) => {
    const { userId, workoutName, workoutNote, date, exercises } = req.body;

    // Check if required fields are missing
    if (!userId || !workoutName || !date || !exercises) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    const newWorkout = new Workout({ userId, workoutName, workoutNote, date, exercises });

    newWorkout.save()
        .then(workout => res.json({ message: "Workout saved!", workout }))
        .catch(err => {
            console.error(err);
            res.status(400).json({ error: "Failed to save workout", err });
        });
});

// Fetch user by ID
router.get("/getUser/:userId", (req, res) => {
    const { userId } = req.params;
    User.findById(userId)
        .then(user => {
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
            const { password, ...userData } = user.toObject();
            res.json(userData);
        })
        .catch(err => {
            console.error("Error fetching user:", err);
            res.status(500).json({ message: "Error fetching user data", err });
        });
});

// Route to get workouts by userId
router.get("/getWorkouts/:userId", (req, res) => {
    const { userId } = req.params;
    console.log("Fetching workouts for userId:", userId);
    Workout.find({ userId })
        .then(workouts => {
            console.log("Fetched workouts:", workouts);
            res.json(workouts);
        })
        .catch(err => {
            console.error("Error fetching workouts:", err);
            res.status(500).json({ message: "Error fetching workouts", err });
        });
});

router.delete("/deleteWorkout/:id", (req, res) => {
    const { id } = req.params;

    Workout.findByIdAndDelete(id)
        .then(result => {
            if (!result) {
                return res.status(404).json({ message: "Workout not found" });
            }
            res.json({ message: "Workout deleted successfully!" });
        })
        .catch(err => {
            console.error("Error deleting workout:", err);
            res.status(500).json({ message: "Error deleting workout", err });
        });
});

// Route to delete a workout by ID
router.delete("/deleteDefaultWorkout/:id", (req, res) => {
    const { id } = req.params;
    console.log("ID received for deletion:", id); // Log the ID to verify it

    DefaultWorkout.findByIdAndDelete(id)
        .then(result => {
            if (!result) {
                console.log("Default Workout not found");
                return res.status(404).json({ message: "Workout not found" });
            }
            res.json({ message: "Default Workout deleted successfully!" });
        })
        .catch(err => {
            console.error("Error deleting workout:", err);
            res.status(500).json({ message: "Error deleting workout", err });
        });
});



// Route for saving default workout
router.post('/saveDefaultWorkout', async (req, res) => {
    try {
        const { userId, workoutName, exercises } = req.body;
        console.log("Received data for saving default workout:", req.body); // Log incoming data

        const newWorkout = new DefaultWorkout({
            userId: userId,
            workoutName: workoutName,
            exercises: exercises
        });

        await newWorkout.save();
        res.status(200).json({ message: 'Workout saved successfully' });
    } catch (error) {
        console.error("Error saving workout:", error); // Log error details
        res.status(400).json({ message: 'Error saving workout', error: error.message });
    }
});

// Route to get default workouts by userId
router.get("/getDefaultWorkouts/:userId", (req, res) => {
    const { userId } = req.params;
    DefaultWorkout.find({ userId })
        .then(workouts => {
            res.json(workouts);
        })
        .catch(err => {
            console.error("Error fetching default workouts:", err);
            res.status(500).json({ message: "Error fetching default workouts", err });
        });
});

router.get('/exercises', async (req, res) => {
        try {
          const { muscleGroup, userId } = req.query;
          let query = { isPublic: true };
      
          if (muscleGroup && muscleGroup !== "All") {
            query.muscleGroup = muscleGroup;
          }
      
          const publicExercises = await Exercise.find(query);
      
          let userExercises = [];
          if (userId) {
        userExercises = await Exercise.find({
            isPublic: false,
            userId: userId,
        });
          }
      
          const exercises = [...publicExercises, ...userExercises];
            console.log("Exercises fetched from DB:", exercises);
          res.status(200).json(exercises);
        } catch (error) {
          console.error('Error fetching exercises:', error);
          res.status(500).json({ message: 'Internal server error' });
        }
      });
      
// Start the server
app.listen(3001, () => {
    console.log("Server is running on port 3001");
});

module.exports = router;