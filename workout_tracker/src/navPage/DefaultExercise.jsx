import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import axios from "axios";

function DefaultExercise() {
  const navigate = useNavigate();
  const [selection, setSelection] = useState("Chest");
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedExercises, setSelectedExercises] = useState([]);
  const [workoutName, setWorkoutName] = useState("Default Workout");
  const inputRef = useRef(null);
  const [isEditable, setIsEditable] = useState(false);
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

  const enableEdit = () => {
    setIsEditable(!isEditable);
    if (!isEditable) {
      inputRef.current.focus();
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      setExercises([]);

      try {
        const response = await axios.get(
          `/api/exercises?muscleGroup=${selection}&userId=${userId}`
        );
        setExercises(response.data);
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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
      setSelectedExercises(selectedExercises.filter(id => id !== exerciseId));
    } else {
      setSelectedExercises([...selectedExercises, exerciseId]);
    }
  };

  const isSelected = (exerciseId) => selectedExercises.includes(exerciseId);

  const handleInputChange = (e) => {
    setWorkoutName(e.target.value);
  };

  const saveWorkoutAndGoBack = () => {
    const newWorkout = {
      userId: userId,
      workoutName: workoutName,
      exercises: selectedExercises,
    };

    axios
      .post("/api/saveDefaultWorkout", newWorkout)
      .then(response => {
        console.log(response.data.message);
        navigate("/workout");
      })
      .catch(error => {
        console.error("Error saving workout:", error);
      });
  };

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
      <div className="beside">
        <input
          ref={inputRef}
          type="text"
          className="workoutName"
          value={workoutName}
          onChange={handleInputChange}
          readOnly={!isEditable}
        />
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

      <div>
        {loading && <p>Loading exercises...</p>}
        {error && <p>Error fetching exercises: {error.message}</p>}
        {!loading && !error && exercises.length === 0 && selection && (
          <p>No exercises found for the selected muscle group.</p>
        )}
        {!loading && !error && exercises.length > 0 && (
          <div>
            {exercises.map(exercise => (
              <div
                key={exercise._id}
                className={`exercise-card ${
                  isSelected(exercise._id) ? "selected" : ""
                }`}
                style={{
                  marginBottom: "1px",
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
    </div>
  );
}

export default DefaultExercise;