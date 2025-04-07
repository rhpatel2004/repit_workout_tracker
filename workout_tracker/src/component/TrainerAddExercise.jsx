import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
// import '../navPage/Workout.css';
import "./CustomExercise.css";

function TrainerAddExercise() {
  const API_URL = import.meta.env.VITE_API_BASE_URL;
  const navigate = useNavigate();

  // --- State for Form Fields ---
  const [exerciseName, setExerciseName] = useState("");
  const [description, setDescription] = useState("");
  const [muscleGroup, setMuscleGroup] = useState(""); // Default to empty
  const [equipment, setEquipment] = useState("");
  const [category, setCategory] = useState(""); // Default to empty

  // --- State for UI Feedback ---
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);

  // --- Dropdown Options ---
  const muscleGroupOptions = [
    // Add a placeholder/disabled option
    { label: "Select Muscle Group", value: "" }, 
    // Keep your original options, excluding "All"
    { label: "Chest", value: "Chest" },
    { label: "Back", value: "Back" },
    { label: "Shoulders", value: "Shoulders" },
    { label: "Legs", value: "Legs" },
    { label: "Biceps", value: "Biceps" },
    { label: "Triceps", value: "Triceps" },
    { label: "Core", value: "Core" },
    { label: "Cardio", value: "Cardio" },
  ];

  const categoryOptions = [
    { label: "Select Category", value: "" }, // Placeholder
    { label: "Strength", value: "strength" },
    { label: "Bodyweight", value: "bodyweight" },
    { label: "Cardio", value: "cardio" },
  ];

  // --- Effects ---
  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    if (storedUserId) {
      setUserId(storedUserId);
    } else {
      console.error("User ID not found. Redirecting to login.");
      navigate("/login"); // Redirect if no user ID
    }
  }, [navigate]);

  // --- Form Submission Handler ---
  const handleSaveExercise = async (e) => {
    e.preventDefault(); // Prevent default browser form submission
    setError(null);

    // Simple Validation
    if (!exerciseName.trim() || !muscleGroup || !category) {
      alert("Please fill in at least Exercise Name, Muscle Group, and Category.");
      return;
    }

    setLoading(true);

    const newExerciseData = {
        // Use the component's userId state, which holds the trainer's ID
        trainerId: userId, 
        name: exerciseName.trim(),
        description: description.trim(),
        muscleGroup: muscleGroup,
        equipment: equipment.trim(), 
        category: category,
        // No need to explicitly send isPublic: true, the backend handles it
      };

    try {
      // *** Replace with your actual API endpoint ***
      const response = await axios.post(`${API_URL}/trainer/addExercise`, newExerciseData); 
      
      console.log("Custom exercise saved:", response.data);
      alert("Custom exercise saved successfully!");
      navigate("/exercises"); // Navigate back after saving
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || "Failed to save exercise.";
      console.error("Error saving custom exercise:", err);
      setError(errorMsg);
      alert(`Error: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  // --- Render ---
  return (
    // Use .page for consistent base padding & background
    <div className="page custom-exercise-page">

      {/* Header */}
      <div className="column" style={{ marginBottom: '2.4rem' }}> 
        <h1 className="heading">
          <button className="topButton" onClick={() => navigate("/exercises")}>
            {/* Back Arrow SVG */}
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M400-80 0-480l400-400 71 71-329 329 329 329-71 71Z" /></svg>
          </button>
        Custom Exercise
        </h1>
      </div>

      {/* Form */}
      {/* Add class for specific form styling if needed */}
      <form onSubmit={handleSaveExercise} className="custom-exercise-form"> 
        
        {/* Exercise Name */}
        <div className="form-group">
          {/* Using a specific class for labels in this form */}
          <label htmlFor="exerciseName" className="form-label">Exercise Name</label>
          <input
            type="text"
            id="exerciseName"
            value={exerciseName}
            onChange={(e) => setExerciseName(e.target.value)}
            placeholder="e.g., Kneeling Cable Crunch"
            required 
          />
        </div>

        {/* Description */}
        <div className="form-group">
          <label htmlFor="description" className="form-label">Description (Optional)</label>
          {/* Reusing .notes class for textarea styling */}
          <textarea
            id="description"
            className="notes" 
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g., How to perform, tips, target muscles..."
            rows={3} // Adjust initial rows as needed
          />
        </div>

        {/* Muscle Group Dropdown */}
        <div className="form-group">
          <label htmlFor="muscleGroup" className="form-label">Muscle Group</label>
          <select
            id="muscleGroup"
            value={muscleGroup}
            onChange={(e) => setMuscleGroup(e.target.value)}
            required
          >
            {muscleGroupOptions.map((option) => (
              // Disable the placeholder option
              <option key={option.value} value={option.value} disabled={option.value === ""}> 
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Equipment */}
        <div className="form-group">
          {/* Label updated */}
          <label htmlFor="equipment" className="form-label">Equipment Needed (Optional)</label> 
          <input
            type="text"
            id="equipment"
            value={equipment}
            onChange={(e) => setEquipment(e.target.value)}
            placeholder="e.g., Barbell, Dumbbells, Cable Machine, None"
          />
        </div>

        {/* Category Dropdown */}
        <div className="form-group">
          <label htmlFor="category" className="form-label">Exercise Category</label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          >
            {categoryOptions.map((option) => (
              // Disable the placeholder option
              <option key={option.value} value={option.value} disabled={option.value === ""}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Display Error Message */}
        {error && <p className="error-message">{error}</p>}

        {/* Save Button */}
        <button
          type="submit"
          // Using primary button style from Workout page
          className="addNewWorkout" 
          disabled={loading} 
          style={{marginTop: '3.2rem'}} // Ensure space above button
        >
          {loading ? "Saving..." : "Save Exercise"}
        </button>
      </form>
      {/* Remove NavBar if it's global or handled by parent route */}
      {/* <NavBar /> */} 
    </div>
  );
}

export default TrainerAddExercise;