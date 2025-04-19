import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import "./MakeWorkout.css";

function SelectExercises() {
  const API_URL = import.meta.env.VITE_API_BASE_URL;

  const navigate = useNavigate();
  const [selection, setSelection] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedExercises, setSelectedExercises] = useState([]);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const storedSelections = sessionStorage.getItem('makeWorkoutSelections');
    if (storedSelections) {
      setSelectedExercises(JSON.parse(storedSelections));
    }

    const storedUserId = localStorage.getItem("userId");
    if (storedUserId) {
      setUserId(storedUserId);
    }
  }, []);

  function handleSelect(event) {
    const selectedValue = event.target.value;
    setSelection(selectedValue);
  }
  // *** Handler for search input changes ***
  function handleSearchChange(event) {
    setSearchQuery(event.target.value);
    // NOTE: For better performance, consider adding DEBOUNCING here
    // to avoid API calls on every single keystroke.
  }

  // --- Fetch Data Effect ---
  useEffect(() => {
    // Prevent fetching if userId isn't loaded yet
    if (!userId) return;

    // --- Debouncing Logic (Recommended for search inputs) ---
    // This waits 300ms after the user stops typing before fetching
    const debounceTimer = setTimeout(() => {
      const fetchData = async () => {
        console.log(`Workspaceing data - Filter: ${selection}, Search: "${searchQuery}"`); // Log when fetch starts
        setLoading(true);
        setError(null);
        // Setting exercises to empty array here causes a flicker,
        // better to just let the new data replace the old.
        // setExercises([]); 

        try {
          const searchParam = encodeURIComponent(searchQuery);
          const response = await axios.get(
            `${API_URL}/exercises?muscleGroup=${selection}&userId=${userId}&search=${searchParam}`
          );

          if (Array.isArray(response.data)) {
            setExercises(response.data);
          } else {
            console.error("API did not return an array:", response.data);
            setError(new Error("Received data is not an array."));
            setExercises([]);
          }
        } catch (error) {
          console.error("Error fetching exercises:", error);
          setError(error);
          setExercises([]);
        } finally {
          setLoading(false);
        }
      };

      fetchData(); // Call fetch inside the timeout function

    }, 300); // 300ms debounce delay - adjust if needed

    // Cleanup function: Clear the timeout if dependencies change before 300ms
    return () => clearTimeout(debounceTimer);
    // --- End Debouncing Logic ---

    // *** Add searchQuery to the dependency array ***
    // Also include API_URL if it could potentially change (e.g., based on environment)
  }, [selection, userId, searchQuery, API_URL]); // Added 'searchQuery' 

  const options = [
    { label: "All", value: "All" },
    { label: "Your Exercises", value: "custom" },
    { label: "Chest", value: "Chest" },
    { label: "Back", value: "Back" },
    { label: "Shoulders", value: "Shoulders" },
    { label: "Legs", value: "Legs" },
    { label: "Biceps", value: "Biceps" },
    { label: "Triceps", value: "Triceps" },
    { label: "Core", value: "Core" },
    { label: "Cardio", value: "Cardio" },
  ];

  const handleExerciseClick = (exercise) => {
    const exerciseId = exercise._id;
    let updatedSelection;
    if (selectedExercises.includes(exerciseId)) {
      setSelectedExercises(
        updatedSelection = selectedExercises.filter((id) => id !== exerciseId)
      );
    } else {
      updatedSelection = [...selectedExercises, exerciseId];
    }
    setSelectedExercises(updatedSelection);
    // *** Save updated selection to session storage immediately ***
    sessionStorage.setItem('makeWorkoutSelections', JSON.stringify(updatedSelection));
  };

  const isSelected = (exerciseId) => selectedExercises.includes(exerciseId);


  const handleGoToMakeWorkout = () => {
    // Save the final selection before navigating
    sessionStorage.setItem('makeWorkoutSelections', JSON.stringify(selectedExercises));
    navigate("/makeWorkout", { state: { selectedExercises } }); // Pass IDs
  };
  
  return (
    <div className="subPage">


      <h1 className="heading">
        <button className="topButton" onClick={() => navigate("/workout")}>
          <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#124559"><path d="M400-80 0-480l400-400 71 71-329 329 329 329-71 71Z" /></svg>
        </button>
        Add Exercise</h1>

      {/* *** Search Input Added *** */}
      <div className="search-container">
        <input
          type="search" // Use type="search" 
          className="search-input" // Add class for styling
          placeholder="Search exercises by name..."
          value={searchQuery}
          onChange={handleSearchChange}
        />
        {/* Optional: You could add a Search Icon SVG absolutely positioned here */}
      </div>

      <div className="column">
        <p className="text" >
          Select Exercises
        </p>

        <select className="dropDown" onChange={handleSelect} value={selection}>
          {options.map((option) => (
            <option key={option.value} className="option" value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <button
        className="addNewWorkout"
        onClick={() => navigate("/customExercise")}
      >
        Add Custom Exercise
      </button>

      <div className="exercise-list-container">
        {loading && <p>Loading exercises...</p>}
        {error && (
          <p className="error-message">
            Error fetching exercises:{" "}
            {error.response?.data?.message || error.message}
          </p>
        )}
        {!loading && !error && exercises.length === 0 && selection && (
          <p>No exercises found.</p>
        )}
        {!loading && !error && exercises.length > 0 && (
          <div>
            {exercises.map((exercise) => (
              <div
                key={exercise._id}
                className={`exercise-card ${isSelected(exercise._id) ? "selected" : ""
                  }`}
                style={{
                  marginBottom: "2px",
                  padding: "15px",
                  backgroundColor: isSelected(exercise._id)
                    ? "#d1e7dd"
                    : "white",
                  cursor: "pointer",
                }}
                onClick={() => handleExerciseClick(exercise)}
              >
                <h3 style={{ letterSpacing: "1.5px" }}>{exercise.name}</h3>
                <p>
                  {exercise.muscleGroup} | {exercise.equipment}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        className="subTickButton"
        onClick={handleGoToMakeWorkout}
      >
        <svg xmlns="http://www.w3.org/2000/svg" height="40px" viewBox="0 -960 960 960" width="40px" fill="#ffffff"><path d="M379.33-244 154-469.33 201.67-517l177.66 177.67 378.34-378.34L805.33-670l-426 426Z" /></svg>
      </button>
    </div>
  );
}

export default SelectExercises;