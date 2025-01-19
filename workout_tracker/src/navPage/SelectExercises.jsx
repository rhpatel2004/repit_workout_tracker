import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import "./MakeWorkout.css"

function SelectExercises() {
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
          `http://localhost:3001/api/exercises?muscleGroup=${selection}&userId=${userId}`
        );
        setExercises(response.data);
      } catch (error) {
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

      <h1 className="heading">Add Exercise</h1>
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

      <div>
        {loading && <p>Loading exercises...</p>}
        {error && <p>Error fetching exercises: {error.message}</p>}
        {!loading && !error && exercises.length === 0 && selection && (
          <p>No exercises found for the selected muscle group.</p>
        )}
        {!loading && !error && exercises.length > 0 && (
          <div>
            {exercises.map((exercise, index) => (
              <div
                key={index}
                className={`exercise-card ${
                  isSelected(exercise._id) ? "selected" : ""
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
    </div>
  );
}

export default SelectExercises;