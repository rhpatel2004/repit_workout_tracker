import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import "./MakeWorkout.css";

function SelectExercises() {
  const API_URL = import.meta.env.VITE_API_BASE_URL;

  const navigate = useNavigate();
  const [selection, setSelection] = useState("All");
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedExercises, setSelectedExercises] = useState([]);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    if (storedUserId) {
      setUserId(storedUserId);
    }
  }, []);

  function handleSelect(event) {
    const selectedValue = event.target.value;
    setSelection(selectedValue);
  }

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      setExercises([]);

      try {
        const response = await axios.get(
          `${API_URL}/exercises?muscleGroup=${selection}&userId=${userId}`
        );
        // Check if response.data is an array before setting the state
        if (Array.isArray(response.data)) {
          setExercises(response.data);
        } else {
          console.error("API did not return an array:", response.data);
          setError(new Error("Received data is not an array."));
        }
      } catch (error) {
        console.error("Error fetching exercises:", error); // Log the error to console
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchData();
    }
  }, [selection, userId]);

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

  const handleExerciseClick = (exercise) => {
    const exerciseId = exercise._id;
    if (selectedExercises.includes(exerciseId)) {
      setSelectedExercises(
        selectedExercises.filter((id) => id !== exerciseId)
      );
    } else {
      setSelectedExercises([...selectedExercises, exerciseId]);
    }
  };

  const isSelected = (exerciseId) => selectedExercises.includes(exerciseId);

  return (
    <div className="subPage">


      <h1 className="heading">
        <button className="topButton" onClick={() => navigate("/workout")}>
          <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#124559"><path d="M400-80 0-480l400-400 71 71-329 329 329 329-71 71Z" /></svg>
        </button>
        Add Exercise</h1>
      <br />

      <div className="column">
        <p className="text" style={{ margin: "20px 0" }}>
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

      <div className="exercise-list-container"> 
        {loading && <p>Loading exercises...</p>}
        {error && (
          <p  className="error-message">
            Error fetching exercises:{" "}
            {error.response?.data?.message || error.message}
          </p>
        )}
        {!loading && !error && exercises.length === 0 && selection && (
          <p>No exercises found for the selected muscle group.</p>
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
        onClick={() =>
          navigate("/makeWorkout", {
            state: { selectedExercises, muscleGroup: selection },
          })
        }
      >
        <svg xmlns="http://www.w3.org/2000/svg" height="40px" viewBox="0 -960 960 960" width="40px" fill="#ffffff"><path d="M379.33-244 154-469.33 201.67-517l177.66 177.67 378.34-378.34L805.33-670l-426 426Z" /></svg>
      </button>
    </div>
  );
}

export default SelectExercises;