require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const User = require("./models/user");
const Workout = require("./models/completedWorkouts"); // Update the import path to completedWorkouts.js
const Folder = require('./models/folders');
const Exercise = require('./models/exercise');
const WorkoutTemplate = require('./models/workoutTemplate'); // Import your WorkoutTemplate model
const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());
app.use(cors());

// const { verifyToken } = require('./middleware/authMiddleware'); // Adjust path if needed
// const JWT_SECRET = process.env.JWT_SECRET_KEY; // Get secret from environment

// if (!JWT_SECRET) {
//     console.error("FATAL ERROR: JWT_SECRET_KEY is not defined.");
//     process.exit(1);
// }
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

router.get("/getWorkouts/:userId", async (req, res) => {
    const { userId } = req.params;
    console.log("Fetching workouts for userId:", userId);

    try {
        const workouts = await Workout.find({ userId })
            .populate({
                path: 'exercises.exerciseId', // Target the exerciseId within the exercises array
                select: 'name category equipment' // Specify the fields you want from the Exercise model
            })
            .sort({ date: -1 }) // Optional: Sort by date descending
            .exec();

        console.log("Fetched and Populated workouts:", JSON.stringify(workouts, null, 2)); // Log to verify structure

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
// In your routes file (e.g., routes/exerciseRoutes.js)

router.get('/exercises', async (req, res) => {
    try {
        const { muscleGroup, userId, trainerId, search } = req.query; 
        console.log(`--- GET /exercises V_FIX2: muscleGroup='${muscleGroup}', userId='${userId || 'N/A'}', trainerId='${trainerId || 'N/A'}', search='${search || ''}' ---`);

        let finalQuery = {};
        const orConditions = [];

        // --- Base Filters ---
        const searchFilter = (search && search.trim() !== "") ? { name: { $regex: new RegExp(search.trim(), 'i') } } : {};
        const muscleGroupFilter = (muscleGroup && !["All", "custom", "trainer_private"].includes(muscleGroup)) 
            ? { muscleGroup: { $regex: new RegExp(`^${muscleGroup}$`, 'i') } } 
            : {};

        // --- Determine Query Logic based on Requester ---

        if (userId) {
            // --- USER REQUEST ---
             console.log("Handling request for a User");

            // Define potential exercises user can see
            // 1. ALL Public exercises 
            orConditions.push({ isPublic: true }); 
            // 2. User's own private custom exercises
            orConditions.push({ isPublic: false, userId: userId });
            // 3. Exercises from the user's assigned trainer (private to trainer/clients)
            try {
                 const user = await User.findById(userId);
                 if (user && user.trainerId) {
                     console.log(`User ${userId} is assigned trainer: ${user.trainerId}`);
                     orConditions.push({ isPublic: false, trainerId: user.trainerId });
                 } else {
                     console.log("User not found or has no assigned trainer.");
                 }
            } catch(userError) {
                 console.error("Error fetching user to find trainerId:", userError);
            }
             
            if (muscleGroup === "custom") {
                 // Filter: ONLY user's custom exercises requested
                 console.log("Filtering for user's custom exercises only.");
                 finalQuery = { 
                     isPublic: false, 
                     userId: userId,
                     ...searchFilter // Apply search within custom
                 };
            } else {
                 // Filter: "All" or Specific Muscle Group
                 // Combine all visible types + apply search/muscle filters
                 finalQuery = {
                     $or: orConditions, // Should see public OR their own OR their trainer's
                     ...searchFilter,
                     ...muscleGroupFilter // Applies filter across the $or results
                 };
            }

        } else if (trainerId) {
            // --- TRAINER REQUEST ---
             console.log("Handling request for a Trainer");

            if (muscleGroup === "trainer_private") {
                 // Filter: ONLY exercises created by this trainer requested
                 console.log("Filtering for exercises added by this trainer only.");
                 finalQuery = {
                     isPublic: false, // Trainer's exercises are private
                     trainerId: trainerId,
                     ...searchFilter // Apply search within these
                 };
                 // No muscle group filter needed here
            } else {
                 // Filter: "All" or Specific Muscle Group
                 // Trainer sees all PUBLIC exercises AND their own added exercises
                 orConditions.push(
                     { isPublic: true },                         // All public exercises
                     { isPublic: false, trainerId: trainerId }  // Added by this trainer (private)
                 );
                 finalQuery = {
                     $or: orConditions,
                     ...searchFilter,
                     ...muscleGroupFilter // Apply muscle group if not "All"
                 };
            }
        } else {
            // --- NO CONTEXT - Show only PUBLIC exercises ---
             console.log("Handling request with no user/trainer context (showing public only).");
             finalQuery = {
                 isPublic: true,
                 // Remove restriction on trainerId having to NOT exist
                 ...searchFilter,
                 ...muscleGroupFilter
             };
        }

        // --- Execute Query ---
        console.log("Final Query:", JSON.stringify(finalQuery));
        const exercises = await Exercise.find(finalQuery);
        console.log(`Found ${exercises.length} exercises.`);
        
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


router.post('/addCustomExercise', async (req, res) => { // Removed 'protect' middleware
    try {
        // 1. Extract data AND userId directly from request body
        // ===>>> THIS IS INSECURE - userId should come from verified token/session <<<===
        const { name, description, muscleGroup, equipment, category, userId } = req.body;

        // 2. Basic check if userId was sent in the body (doesn't verify the user!)
        if (!userId) {
            // Decide how to handle missing userId during testing
            // Option 1: Return an error
            return res.status(400).json({ message: 'User ID missing in request body (INSECURE - requires auth)' });
            // Option 2: Use a default test ID (Less ideal)
            // const testUserId = 'YOUR_TEST_USER_ID'; // Replace with a valid ObjectId for testing
            // userId = testUserId; 
        }

        // 3. Basic Validation for other fields
        if (!name || !muscleGroup || !category) {
            return res.status(400).json({ message: 'Missing required fields: name, muscleGroup, and category' });
        }
        const validCategories = Exercise.schema.path('category').enumValues;
        if (!validCategories.includes(category.toLowerCase())) {
            return res.status(400).json({ message: `Invalid category. Must be one of: ${validCategories.join(', ')}` });
        }


        // 4. Create new exercise document instance
        const newCustomExercise = new Exercise({
            name: name.trim(),
            description: description ? description.trim() : undefined,
            muscleGroup: muscleGroup,
            equipment: equipment ? equipment.trim() : 'Bodyweight',
            category: category.toLowerCase(),
            isPublic: false, // Set to false for custom exercises
            userId: userId,  // *** Using potentially insecure userId from request body ***
        });

        // 5. Save to database
        const savedExercise = await newCustomExercise.save();

        // 6. Send success response
        console.log('Custom exercise saved (INSECURELY linked to):', userId);
        res.status(201).json({
            message: 'Custom exercise saved (INSECURE - NO AUTH)',
            exercise: savedExercise
        });

    } catch (error) {
        // 7. Handle potential errors
        console.error("Error saving custom exercise (NO AUTH):", error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: 'Validation Error', errors: error.errors });
        }
        res.status(500).json({ message: 'Server error while adding custom exercise.' });
    }
});
router.post('/trainer/addExercise', async (req, res) => {
    try {
        // Get data including trainerId from body (INSECURE)
        const { name, description, muscleGroup, equipment, category, trainerId } = req.body;

        // Validation...
        if (!trainerId) { return res.status(400).json({ message: 'Trainer ID missing...' }); }
        if (!name || !muscleGroup || !category) { return res.status(400).json({ message: 'Missing fields...' }); }
        const validCategories = Exercise.schema.path('category').enumValues;
        if (!validCategories.includes(category.toLowerCase())) {
            return res.status(400).json({ message: `Invalid category. Must be one of: ${validCategories.join(', ')}` });
        }

        const newExercise = new Exercise({
            name: name.trim(),
            description: description ? description.trim() : undefined,
            muscleGroup: muscleGroup,
            equipment: equipment ? equipment.trim() : 'Bodyweight',
            category: category.toLowerCase(),

            // *** Trainer adding exercise: isPublic IS FALSE, link trainerId ***
            isPublic: false,
            trainerId: trainerId,  // Link to the trainer who created it
            userId: null,          // Not linked to a specific user 
        });

        const savedExercise = await newExercise.save();

        console.log('Trainer custom exercise saved (private, tagged):', trainerId);
        res.status(201).json({
            message: 'Exercise added successfully!',
            exercise: savedExercise
        });

    } catch (error) {
        console.error("Error in /trainer/addExercise route:", error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: 'Validation Error', errors: error.errors });
        }
        res.status(500).json({ message: 'Server error while adding exercise.' });
    }
});

// Create a Folder (for the logged-in user)
router.post('/folders', async (req, res) => { // Add verifyToken later
    try {
        const { name } = req.body;
        // const userId = req.user.userId; // Get from verified token LATER
        const userId = req.body.userId; // TEMPORARY - Get from request body

        if (!userId) return res.status(401).json({ message: "User ID required (Auth missing)" });
        if (!name || !name.trim()) return res.status(400).json({ message: "Folder name is required" });

        const newFolder = new Folder({
            userId: userId, // Associate with the user
            name: name.trim(),
            isDefaultTrainerFolder: false,
            trainerId: null
        });

        const savedFolder = await newFolder.save();
        res.status(201).json(savedFolder);
    } catch (error) {
        console.error("Error creating folder:", error);
        res.status(500).json({ message: "Error creating folder", error: error.message });
    }
});

// Get Folders for a User
router.get('/folders', async (req, res) => { // Add verifyToken later
    try {
        const userId = req.query.userId; // Get from query parameter (TEMPORARY)
        // const userId = req.user.userId; // Get from verified token LATER

        if (!userId) return res.status(401).json({ message: "User ID required (Auth missing)" });

        const folders = await Folder.find({ userId: userId }); // Find folders ONLY for this user
        res.status(200).json(folders);
    } catch (error) {
        console.error("Error fetching folders:", error);
        res.status(500).json({ message: "Error fetching folders", error: error.message });
    }
});


// --- Workout Template Routes ---

// Create a Workout Template
router.post('/workout-templates', async (req, res) => { // Add verifyToken later
    try {
        const { name, exercises, folderId } = req.body;
        // const userId = req.user.userId; // Get from verified token LATER
        const userId = req.body.userId; // TEMPORARY

        if (!userId) return res.status(401).json({ message: "User ID required (Auth missing)" });
        if (!name || !exercises || !Array.isArray(exercises)) {
            return res.status(400).json({ message: 'Missing required fields (name, exercises)' });
        }
        if (folderId && !mongoose.Types.ObjectId.isValid(folderId)) {
             return res.status(400).json({ message: 'Invalid folder ID format' });
        }

        // Optional: Check if folderId actually belongs to the user if provided
        if (folderId) {
            const folder = await Folder.findOne({ _id: folderId, userId: userId });
            if (!folder) {
                return res.status(404).json({ message: 'Folder not found or does not belong to user' });
            }
        }

        const newTemplate = new WorkoutTemplate({
            userId, // Template belongs to this user
            trainerId: null, // Not created by a trainer
            name: name.trim(),
            exercises: exercises.map(exerciseId => ({ exerciseId })), // Ensure correct format
            folderId: folderId || null, // Assign folderId or null
        });

        const savedTemplate = await newTemplate.save();
        res.status(201).json(savedTemplate);
    } catch (error) {
        console.error("Error creating workout template:", error);
        res.status(500).json({ message: "Error creating workout template", error: error.message });
    }
});

// Get Workout Templates for a User
router.get('/workout-templates', async (req, res) => { // Add verifyToken later
    try {
        const userId = req.query.userId; // Get from query parameter (TEMPORARY)
         // const userId = req.user.userId; // Get from verified token LATER

        if (!userId) return res.status(401).json({ message: "User ID required (Auth missing)" });

        // Find templates created ONLY by this user
        const templates = await WorkoutTemplate.find({ userId: userId })
                            .populate('exercises.exerciseId', 'name'); // Populate exercise names
        res.status(200).json(templates);
    } catch (error) {
        console.error("Error fetching workout templates:", error);
        res.status(500).json({ message: "Error fetching workout templates", error: error.message });
    }
});

// Delete Workout Template (Example - Needs Auth)
router.delete('/workout-templates/:templateId', async (req, res) => { // Add verifyToken later
    try {
        const { templateId } = req.params;
        // const userId = req.user.userId; // Get from verified token LATER
        const userId = req.body.userId; // TEMPORARY

        if (!userId) return res.status(401).json({ message: "User ID required (Auth missing)" });
        if (!mongoose.Types.ObjectId.isValid(templateId)) {
            return res.status(400).json({ message: 'Invalid template ID' });
        }

        // Find and delete template only if it belongs to the user
        const result = await WorkoutTemplate.findOneAndDelete({ _id: templateId, userId: userId });

        if (!result) {
            return res.status(404).json({ message: 'Template not found or unauthorized' });
        }

        res.status(200).json({ message: 'Template deleted successfully' });
    } catch (error) {
        console.error("Error deleting workout template:", error);
        res.status(500).json({ message: 'Error deleting workout template', error: error.message });
    }
});


// Start the server
const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});