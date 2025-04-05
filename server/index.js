require('dotenv').config(); 
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const User = require("./models/user");
const Workout = require("./models/completedWorkouts"); // Update the import path to completedWorkouts.js
const DefaultWorkout = require('./models/default');
const Exercise = require('./models/Exercise');
const WorkoutTemplate = require('./models/workoutTemplate'); // Import your WorkoutTemplate model
const bcrypt = require('bcrypt');

const app = express();
app.use(express.json());
app.use(cors());

// Create the router instance here
const router = express.Router();

// Connect to MongoDB using the environment variable
const dbURI = process.env.MONGODB_URI;

if (!dbURI) {
    console.error("Error: MONGODB_URI environment variable not set.");
    process.exit(1); // Exit if the connection string is missing
}

mongoose.connect(dbURI) // Use the variable here
    .then(() => console.log("MongoDB Atlas connected")) // Update log message
    .catch(err => console.error("MongoDB Atlas connection error:", err));

// Connect to MongoDB
// mongoose.connect("mongodb://localhost:27017/GymRats", { useNewUrlParser: true, useUnifiedTopology: true })
//     .then(() => console.log("MongoDB connected"))
//     .catch(err => console.error("MongoDB connection error:", err));

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
// Create a Workout Template
router.post('/workout-templates', async (req, res) => {
    try {
        const { name, exercises, userId, folderId } = req.body;

        // Basic validation
        if (!name || !exercises || !Array.isArray(exercises) || !userId) {
            return res.status(400).json({ message: 'Missing required fields (name, exercises, userId)' });
        }

        const newTemplate = new WorkoutTemplate({
            userId,
            name,
            exercises: exercises.map(exerciseId => ({ exerciseId })), // Store only exerciseId
            folderId: folderId || null, // Allow for no folder (default folder)
        });

        const savedTemplate = await newTemplate.save();
        res.status(201).json(savedTemplate);
    } catch (error) {
        console.error("Error creating workout template:", error);
        res.status(500).json({ message: "Error creating workout template", error: error.message });
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
// --- Folder Routes ---

// Create a Folder
router.post('/folders', async (req, res) => {
    try {
        const { name } = req.body;
        const userId = req.body.userId;  // Get userId from request body (TEMPORARY - see note below)

        // *** IMPORTANT: In a real application, you would get the userId from the
        //     authenticated user (e.g., req.user._id after verifying a JWT).
        //     For now, we're using req.body.userId for testing ONLY.  ***

        if (!userId) {
            return res.status(400).json({ message: "userId is required." });
        }
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User Not Found." })
        }

        const newFolder = new Folder({
            userId: user.role === 'user' ? userId : null,
            trainerId: user.role === 'trainer' ? userId : null,
            name,
            isDefaultTrainerFolder: false, // User-created folders are not default trainer folders
        });

        const savedFolder = await newFolder.save();
        res.status(201).json(savedFolder);
    } catch (error) {
        console.error("Error creating folder:", error);
        res.status(500).json({ message: "Error creating folder", error: error.message });
    }
});

// Get Folders for a User/Trainer
router.get('/folders', async (req, res) => {
    try {
        const userId = req.query.userId;  // Get from query parameter (TEMPORARY)
        // *** IMPORTANT:  Replace this with req.user._id in a real, authenticated app ***
        if (!userId) {
            return res.status(400).json({ message: "userId is required." });
        }
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User Not Found." });
        }
        let query = {};

        //If user is trainer, find all folders of him/her.
        if (user.role === 'trainer') {
            query = { trainerId: userId }
        }
        // if user is trainee, find all his/her folders, and also the default folders of his/her trainer
        if (user.role === 'user') {
            query = {
                $or: [
                    { userId: userId }, // Folders created by the user
                    { trainerId: user.trainerId, isDefaultTrainerFolder: true } // Folders created by the user's trainer
                ]
            }
        }

        const folders = await Folder.find(query);
        res.status(200).json(folders);
    } catch (error) {
        console.error("Error fetching folders:", error);
        res.status(500).json({ message: "Error fetching folders", error: error.message });
    }
});

// Add a Workout Template to a Folder  (PUT request)
router.put('/folders/:folderId/templates/:templateId', async (req, res) => {
    try {
        const { folderId, templateId } = req.params;
        const userId = req.body.userId; // Get the userId from request body (for now)
        if (!userId) {
            return res.status(400).json({ message: "userId is required." });
        }
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User Not Found." });
        }

        // 1. Find the folder and template, and validate ownership.
        const folder = await Folder.findById(folderId);
        if (!folder) {
            return res.status(404).json({ message: 'Folder not found' });
        }

        //check the ownership of folder.
        if (folder.userId.toString() !== userId && folder.trainerId.toString() !== userId) { // Use toString() for ObjectId comparison
            return res.status(403).json({ message: 'Unauthorized: You do not own this folder' });
        }

        const template = await WorkoutTemplate.findById(templateId);
        if (!template) {
            return res.status(404).json({ message: 'Workout template not found' });
        }

        // 2. Check if the template is already in the folder.
        if (template.folderId && template.folderId.toString() === folderId) {
            return res.status(400).json({ message: 'Template already in this folder' });
        }

        // 3. Update the template's folderId.
        template.folderId = folderId;
        await template.save();

        res.status(200).json({ message: 'Template added to folder successfully', template });
    } catch (error) {
        console.error('Error adding template to folder:', error);
        res.status(500).json({ message: 'Error adding template to folder', error: error.message });
    }
});

// Remove a Workout Template from a Folder (DELETE request)
//Very similar to PUT, but set folderId = null.
router.delete('/folders/:folderId/templates/:templateId', async (req, res) => {
    try {
        const { folderId, templateId } = req.params;
        const userId = req.body.userId; // TEMPORARY.  Get from req.user._id

        const folder = await Folder.findById(folderId);
        const template = await WorkoutTemplate.findById(templateId);

        if (!folder || !template) {
            return res.status(404).json({ message: 'Folder or template not found' });
        }
        if (folder.userId.toString() !== userId && folder.trainerId.toString() !== userId) { // Use toString() for ObjectId comparison
            return res.status(403).json({ message: 'Unauthorized: You do not own this folder' });
        }
        if (template.userId.toString() !== userId && template.trainerId.toString() !== userId) { // Use toString() for ObjectId comparison
            return res.status(403).json({ message: 'Unauthorized: You do not own this template' });
        }


        // Unlink the template from folder
        template.folderId = null;
        await template.save();

        res.status(200).json({ message: 'Template removed from folder' });

    } catch (error) {
        console.error("Error removing template from folder", error);
        res.status(500).json({ message: 'Error removing template from folder', error: error.message });
    }
});

// --- Workout Template Routes ---
// Modified Create Workout Template Route
router.post('/workout-templates', async (req, res) => {
    try {
        const { name, exercises, folderId } = req.body;
        const userId = req.body.userId; // Get from request body TEMPORARILY

        // Basic validation
        if (!name || !exercises || !Array.isArray(exercises)) {
            return res.status(400).json({ message: 'Missing required fields (name, exercises)' });
        }
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }
        const newTemplate = new WorkoutTemplate({
            name,
            exercises: exercises.map(exerciseId => ({ exerciseId })), // Store only exerciseId
            userId: user.role === 'user' ? userId : null, // Set userId for regular users
            trainerId: user.role === 'trainer' ? userId : null, // Set trainerId for trainers
            folderId: folderId ? folderId : null
        });

        const savedTemplate = await newTemplate.save();

        res.status(201).json(savedTemplate);

    } catch (error) {
        console.error("Error creating workout template:", error);
        res.status(500).json({ message: "Error creating workout template", error: error.message });
    }
});


// Get Workout Templates (modified to include folderId)
router.get('/workout-templates', async (req, res) => {
    try {
        const userId = req.query.userId; // Get from request body TEMPORARILY.
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        let query = {};

        //If user is trainer, find all templates of him/her.
        if (user.role === 'trainer') {
            query = { trainerId: userId }
        }
        // if user is trainee, find all his/her templates, and also the default templates of his/her trainer
        if (user.role === 'user') {
            query = {
                $or: [
                    { userId: userId }, // Templates created by the user
                    { trainerId: user.trainerId } // Templates created by the user's trainer
                ]
            }
        }

        const templates = await WorkoutTemplate.find(query).populate('exercises.exerciseId', 'name');
        res.status(200).json(templates);
    } catch (error) {
        console.error("Error fetching workout templates:", error);
        res.status(500).json({ message: "Error fetching workout templates", error: error.message });
    }
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


// Route to get all clients of a trainer 
// (without isTrainer middleware for now)
router.get('/trainer/clients', async (req, res) => {
    try {
        const trainerId = req.query.trainerId; // Get trainerId from query parameter

        if (!trainerId) {
            return res.status(400).json({ message: "Trainer ID is required" });
        }

        // Important: Validate trainerId to be a valid ObjectId (for security)
        if (!mongoose.Types.ObjectId.isValid(trainerId)) {
            return res.status(400).json({ message: "Invalid trainer ID format" });
        }

        // Find all users who have the current trainer's ID in their trainerId field
        const clients = await User.find({ trainerId: trainerId, role: 'user' }, '_id firstName lastName profilePictureUrl');

        console.log("Fetched clients:", clients);

        res.status(200).json(clients);
    } catch (error) {
        console.error('Error fetching clients for trainer:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Route to get workouts by userId
router.get("/getWorkouts/:userId", async (req, res) => {
    const { userId } = req.params;
    console.log("Fetching workouts for userId:", userId);
    try {
        const workouts = await Workout.find({ userId })
            .populate("userId", "firstName")
            .populate({
                path: "exercises.exerciseId",
                select: "name category equipment", // Include category in populated exercises
            })
            .exec();

        console.log("Fetched workouts:", workouts);
        res.status(200).json(workouts);
    } catch (err) {
        console.error("Error fetching workouts:", err);
        res.status(500).json({ message: "Error fetching workouts", err });
    }
});

// Start the server
const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});