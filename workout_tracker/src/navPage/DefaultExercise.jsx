import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import axios from "axios";

function DefaultExercise() {
  const navigate = useNavigate();

  // State variables
  const [selection, setSelection] = useState("All"); // Currently selected muscle group (default to "All")
  const [exercises, setExercises] = useState([]); // List of exercises fetched from the database
  const [loading, setLoading] = useState(false); // Loading indicator
  const [error, setError] = useState(null); // Error message
  const [selectedExercises, setSelectedExercises] = useState([]); // List of selected exercise IDs
  const [workoutName, setWorkoutName] = useState("Default Workout"); // Name of the workout
  const inputRef = useRef(null); // Ref for the workout name input field
  const [isEditable, setIsEditable] = useState(false); // Flag to make workout name editable
  const [userId, setUserId] = useState(null); // User ID

  // Fetch userId from local storage on component mount
  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    if (storedUserId) {
      setUserId(storedUserId);
    }
  }, []);

  // Handle change in muscle group selection
  function handleSelect(event) {
    setSelection(event.target.value);
  }

  // Toggle edit mode for workout name
  const enableEdit = () => {
    setIsEditable(!isEditable);
    if (!isEditable) {
      inputRef.current.focus();
    }
  };

  // Fetch exercises from the database based on selection and userId
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      setExercises([]); // Clear existing exercises

      try {
        // Use the full URL to your backend server:
        const response = await axios.get(
          `http://localhost:3001/api/exercises?muscleGroup=${selection}&userId=${userId}`
        );

        // Assuming your API returns an array directly:
        if (Array.isArray(response.data)) {
          setExercises(response.data);
        } else {
          console.error("API response is not an array:", response.data);
          setError(new Error("Invalid data format received from server."));
        }
      } catch (error) {
        console.error("Error fetching exercises:", error);
        setError(
          new Error(
            "Failed to fetch exercises. Please make sure your server is running and accessible."
          )
        );
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchData();
    }
  }, [selection, userId]);

  // Options for the muscle group select dropdown
  const options = [
    { label: "All", value: "All" },
    { label: "Chest", value: "Chest" },
    { label: "Back", value: "Back" },
    { label: "Shoulders", value: "Shoulders" },
    { label: "Legs", value: "Legs" },
    { label: "Biceps", value: "Biceps" },
    { label: "Triceps", value: "Triceps" },
    { label: "Core", value: "Core" },
    { label: "Cardio", value: "Cardio" },
  ];

  // Handle clicks on exercise cards
  const handleExerciseClick = (exercise) => {
    const exerciseId = exercise._id;
    if (selectedExercises.includes(exerciseId)) {
      // Remove exercise ID if already selected
      setSelectedExercises(selectedExercises.filter(id => id !== exerciseId));
    } else {
      // Add exercise ID to selectedExercises
      setSelectedExercises([...selectedExercises, exerciseId]);
    }
  };

  // Check if an exercise is selected
  const isSelected = (exerciseId) => selectedExercises.includes(exerciseId);

  // Handle changes to the workout name input field
  const handleInputChange = (e) => {
    setWorkoutName(e.target.value);
  };

  // Save the workout and navigate back
  const saveWorkoutAndGoBack = () => {
    const newWorkout = {
      userId: userId,
      workoutName: workoutName,
      exercises: selectedExercises, // Array of exercise IDs
    };

    axios
      .post("http://localhost:3001/api/saveDefaultWorkout", newWorkout) // Use full URL
      .then(response => {
        console.log(response.data.message);
        navigate("/workout");
      })
      .catch(error => {
        console.error("Error saving workout:", error);
        setError(new Error("Failed to save workout. Please try again.")); // Set error state
      });
  };

  return (
    <div className="subPage">
      {/* Back Button */}
      <button className="topButton" onClick={() => navigate("/workout")}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          height="30px"
          viewBox="0 -960 960 960"
          width="30px"
          fill="#124559"
        >
          <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z" />
        </svg>
      </button>

      {/* Save Workout Button */}
      <button className="subTickButton" onClick={saveWorkoutAndGoBack}>
        <svg
          className="tickText"
          xmlns="http://www.w3.org/2000/svg"
          height="40px"
          viewBox="0 -960 960 960"
          width="40px"
          fill="#EFF6E0"
        >
          <path d="M379.33-244 154-469.33 201.67-517l177.66 177.67 378.34-378.34L805.33-670l-426 426Z" />
        </svg>
      </button>

      <br />

      {/* Workout Name Input */}
      <div className="beside">
        <input
          ref={inputRef}
          type="text"
          className="workoutName"
          value={workoutName}
          onChange={handleInputChange}
          readOnly={!isEditable}
        />
        {/* Edit Button */}
        <button className="topButton" onClick={enableEdit}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="30px"
            viewBox="0 -960 960 960"
            width="30px"
            fill="#124559"
          >
            <path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z" />
          </svg>
        </button>
      </div>

      <br />

      {/* Muscle Group Selection */}
      <div className="column">
        <p className="text">Select Exercises</p>
        <select className="dropDown" onChange={handleSelect} value={selection}>
          {options.map(option => (
            <option key={option.value} className="option" value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Exercise List */}
      <div>
        {loading && <p>Loading exercises...</p>}
        {error && <p>Error fetching exercises: {error.message}</p>}

        {/* Handle case where no exercises are found */}
        {!loading && !error && exercises.length === 0 && (
          <p>No exercises found.</p>
        )}

        {/* Display exercises if available */}
        {!loading && !error && exercises.length > 0 && (
          <div>
            {exercises.map(exercise => (
              <div
                key={exercise._id}
                className={`exercise-card ${isSelected(exercise._id) ? "selected" : ""}`}
                style={{
                  marginBottom: "1px",
                  padding: "15px",
                  backgroundColor: isSelected(exercise._id) ? "#d1e7dd" : "white",
                  cursor: "pointer",
                }}
                onClick={() => handleExerciseClick(exercise)}
              >
                <h3 style={{ letterSpacing: "1.5px" }}>{exercise.name}</h3>
                <p>{exercise.muscleGroup} | {exercise.equipment}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default DefaultExercise;