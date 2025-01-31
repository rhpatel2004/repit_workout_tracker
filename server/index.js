const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const User = require("./models/user");
const Workout = require("./models/completedWorkouts"); // Update the import path to completedWorkouts.js
const DefaultWorkout = require('./models/default');
const Exercise = require('./models/Exercise');
const bcrypt = require('bcrypt');

const app = express();
app.use(express.json());
app.use(cors());

// Create the router instance here
const router = express.Router();

// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/GymRats", { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.error("MongoDB connection error:", err));

// Use '/api' as the base URL for your API routes
app.use('/api', router);

// Route to register a new user
router.post("/register", async (req, res) => {
    const { firstName, lastName, email, password, phoneNumber, role, trainerId } = req.body;

    try {
        // Check if a user with the given email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User with this email already exists." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            phoneNumber,
            role,
            trainerId: role === 'user' && trainerId ? trainerId : null, // Handle null trainerId
        });
        res.status(201).json(user);
    } catch (err) {
        console.error("Error during user registration:", err);
        res.status(400).json({ message: "Error registering user", error: err.message });
    }
});

// Route for login
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Incorrect password" });
        }

        res.status(200).json({ message: "Success", userId: user._id, role: user.role });
    } catch (err) {
        console.error("Error during login:", err);
        res.status(500).json({ message: "Login error", error: err.message });
    }
});

// Route to get all trainers
router.get('/trainers', async (req, res) => {
    try {
        const trainers = await User.find({ role: 'trainer' }, '_id firstName lastName');
        res.status(200).json(trainers);
    } catch (err) {
        console.error("Error fetching trainers:", err);
        res.status(500).json({ message: "Error fetching trainers", err });
    }
});

// Route to save workout
router.post("/saveWorkout", async (req, res) => {
    console.log("Received request body in /api/saveWorkout:", req.body);
  
    const { userId, workoutTemplateId, name, date, duration, notes, exercises, isTemplate } = req.body;
  
    try {
      if (!userId || !name || !date || !exercises) {
        return res.status(400).json({ error: "Missing required fields" });
      }
  
      // Ensure exercises is an array
      if (!Array.isArray(exercises)) {
        return res.status(400).json({ error: "Exercises must be an array" });
      }
  
      // Map exercises and sets, setting default values if not provided
      const workoutExercises = exercises.map(exercise => ({
        exerciseId: exercise.exerciseId,
        sets: exercise.sets.map(set => ({
          reps: set.reps || null,
          weight: set.weight || null,
          duration: set.duration || null,
          distance: set.distance || null, // Make sure distance is included
          restTime: set.restTime || null
        }))
      }));
  
      const newWorkout = new Workout({
        userId,
        workoutTemplateId,
        name,
        date,
        duration,
        notes,
        exercises: workoutExercises, // Use the transformed exercises array
        isTemplate: isTemplate || false,
      });
  
      const savedWorkout = await newWorkout.save();
      res.status(201).json({ message: "Workout saved!", workout: savedWorkout });
    } catch (err) {
      console.error("Error saving workout:", err);
      res.status(500).json({ error: "Failed to save workout", message: err.message });
    }
  });

// Route to fetch user by ID with trainer's name populated
router.get("/getUser/:userId", async (req, res) => {
    const { userId } = req.params;

    try {
        const user = await User.findById(userId).populate("trainerId", "firstName lastName");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const { password, ...userData } = user.toObject();
        res.status(200).json(userData);
    } catch (err) {
        console.error("Error fetching user:", err);
        res.status(500).json({ message: "Error fetching user data", err });
    }
});

// Route to get workouts by userId
router.get("/getWorkouts/:userId", async (req, res) => {
    const { userId } = req.params;
    console.log("Fetching workouts for userId:", userId);

    try {
        const workouts = await Workout.find({ userId })
            .populate({
                path: 'exercises.exerciseId',
                select: 'name category' // Specify the fields you want to populate
            })
            .exec();

        console.log("Fetched workouts:", workouts);
        res.status(200).json(workouts);
    } catch (err) {
        console.error("Error fetching workouts:", err);
        res.status(500).json({ message: "Error fetching workouts", err });
    }
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
    console.log("ID received for deletion:", id);

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
        console.log("Received data for saving default workout:", req.body);

        const newWorkout = new DefaultWorkout({
            userId: userId,
            workoutName: workoutName,
            exercises: exercises
        });

        await newWorkout.save();
        res.status(200).json({ message: 'Workout saved successfully' });
    } catch (error) {
        console.error("Error saving workout:", error);
        res.status(400).json({ message: 'Error saving workout', error: error.message });
    }
});

// Route to get default workouts by userId
router.get("/getDefaultWorkouts/:userId", (req, res) => {
    const { userId } = req.params;
    DefaultWorkout.find({ userId })
        .then(workouts => res.json(workouts))
        .catch(err => {
            console.error("Error fetching default workouts:", err);
            res.status(500).json({ message: "Error fetching default workouts", err });
        });
});

// Route to get a single exercise by ID
router.get('/exercise/:id', async (req, res) => {
    try {
        const exerciseId = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(exerciseId)) {
            return res.status(400).json({ message: 'Invalid exercise ID' });
        }

        const exercise = await Exercise.findById(exerciseId);

        if (!exercise) {
            return res.status(404).json({ message: 'Exercise not found' });
        }

        res.status(200).json(exercise);
    } catch (error) {
        console.error('Error fetching exercise:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Route to get exercises
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
            userExercises = await Exercise.find({ isPublic: false, userId: userId });
        }

        const exercises = [...publicExercises, ...userExercises];
        console.log("Fetched exercises:", exercises);
        res.status(200).json(exercises);
    } catch (error) {
        console.error('Error fetching exercises:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Start the server
const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});