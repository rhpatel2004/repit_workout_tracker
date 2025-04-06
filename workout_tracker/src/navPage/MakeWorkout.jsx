import React, { useState, useEffect } from "react";
import axios from "axios";
import NavBar from "../NavBar";
import { useLocation, useNavigate } from "react-router-dom";
import "./MakeWorkout.css";

function MakeWorkout() {
  const API_URL = import.meta.env.VITE_API_BASE_URL;

  const location = useLocation();
  const navigate = useNavigate();
  const selectedExerciseIds = location.state?.selectedExercises || [];
  const [exercises, setExercises] = useState([]);
  const [setsData, setSetsData] = useState({});
  const [userId, setUserId] = useState(null);
  const [workoutName, setWorkoutName] = useState("My Workout");
  const [isEditable, setIsEditable] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [workoutNote, setWorkoutNote] = useState(""); // State for workout note
  const [selectedDate, setSelectedDate] = useState(new Date()); // State for selected date

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    if (storedUserId) {
      setUserId(storedUserId);
    }

    if (selectedExerciseIds.length > 0) {
      fetchExercisesDetails();
      setStartTime(new Date());
    }
  }, [selectedExerciseIds]);

  const fetchExercisesDetails = async () => {
    try {
      const exercisesDetails = await Promise.all(
        selectedExerciseIds.map(async (id) => {
          const response = await axios.get(
            `${API_URL}/exercise/${id}`
          );
          return response.data;
        })
      );
      setExercises(exercisesDetails);
      initializeSetsData(exercisesDetails);
    } catch (error) {
      console.error("Error fetching exercise details:", error);
    }
  };

  const initializeSetsData = (exercisesDetails) => {
    let newSetsData = {};
    exercisesDetails.forEach((exercise) => {
      newSetsData[exercise._id] = [
        { reps: "", weight: "", duration: "", distance: "", restTime: "" },
      ];
    });
    setSetsData(newSetsData);
  };

  const handleInputChange = (exerciseId, setIndex, field, value) => {
    setSetsData((prevSetsData) => ({
      ...prevSetsData,
      [exerciseId]: prevSetsData[exerciseId].map((set, index) =>
        index === setIndex ? { ...set, [field]: value } : set
      ),
    }));
  };

  const addSet = (exerciseId) => {
    setSetsData((prevSetsData) => ({
      ...prevSetsData,
      [exerciseId]: [
        ...prevSetsData[exerciseId],
        { reps: "", weight: "", duration: "", distance: "", restTime: "" },
      ],
    }));
  };

  const removeSet = (exerciseId, setIndex) => {
    setSetsData((prevSetsData) => ({
      ...prevSetsData,
      [exerciseId]: prevSetsData[exerciseId].filter(
        (_, index) => index !== setIndex
      ),
    }));
  };

  const handleWorkoutNameChange = (e) => {
    setWorkoutName(e.target.value);
  };

  const toggleEditWorkoutName = () => {
    setIsEditable(!isEditable);
  };

  const saveWorkout = async () => {
    const endTime = new Date();
    const duration = Math.round((endTime - startTime) / (1000 * 60));

    const workoutData = {
        userId: userId,
        workoutTemplateId: null, // Set to null for custom workouts
        name: workoutName,
        date: selectedDate, // Use selectedDate
        duration: duration,
        notes: workoutNote, // Include workoutNote
        exercises: exercises.map(exercise => ({
          exerciseId: exercise._id,
          sets: setsData[exercise._id] || []
        })),
        isTemplate: false,
      };

    try {
      const response = await axios.post(`${API_URL}/saveWorkout`, workoutData);
      console.log("Workout saved successfully:", response.data);
      alert("Workout saved successfully!");
      navigate("/history");
    } catch (error) {
      console.error("Error saving workout:", error);
      if (error.response) {
        console.error("Data:", error.response.data);
        console.error("Status:", error.response.status);
        console.error("Headers:", error.response.headers);
        alert(`Failed to save workout: ${error.response.data.message}`);
      } else if (error.request) {
        console.error("No response received:", error.request);
        alert("Failed to save workout: No response from server");
      } else {
        console.error("Error", error.message);
        alert(`Failed to save workout: ${error.message}`);
      }
    }
  };

  return (
    <div className="page">
      <div className="column">
        <h1 className="heading">
          <button
            className="topButton"
            onClick={() => navigate("/selectExercises")}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="24px"
              viewBox="0 -960 960 960"
              width="24px"
              fill="#124559"
            >
              <path d="M400-80 0-480l400-400 71 71-329 329 329 329-71 71Z" />
            </svg>
          </button>
          Create Workout
        </h1>
      </div>

      <div className="beside">
        <input
          type="text"
          className="workoutName"
          value={workoutName}
          onChange={handleWorkoutNameChange}
          readOnly={!isEditable}
        />
        <button className="edit" onClick={toggleEditWorkoutName}>
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

      {/* Workout Note Input */}
      <div className="noteDiv">
        <p className="text">Workout Note</p>
        <textarea
          className="notes"
          placeholder="Enter workout notes here..."
          value={workoutNote}
          onChange={(e) => setWorkoutNote(e.target.value)}
        />
      </div>

      {/* Date Selection */}
      <div className="beside">
        <p className="text">Date</p>
        <input
          className="picker"
          type="date"
          value={selectedDate.toISOString().slice(0, 10)}
          onChange={(e) =>
            setSelectedDate(new Date(e.target.value + "T00:00:00"))
          }
        />
      </div>

      <div className="content-container">
        {exercises.map((exercise) => (
          <div key={exercise._id}>
            <h3 className="exercise-name">{exercise.name}</h3>
            <div className="sets-container">
              {setsData[exercise._id]?.map((set, setIndex) => (
                <div key={setIndex} className="column1">
                  <h4 className="set-heading">Set {setIndex + 1}</h4>
                  {exercise.category === "strength" && (
                    <div className="column2">
                      <input
                        className="detailInp"
                        type="number"
                        placeholder="Reps"
                        value={set.reps}
                        onChange={(e) =>
                          handleInputChange(
                            exercise._id,
                            setIndex,
                            "reps",
                            e.target.value
                          )
                        }
                      />
                      <input
                        className="detailInp"
                        type="number"
                        placeholder="Weight(kg)"
                        value={set.weight}
                        onChange={(e) =>
                          handleInputChange(
                            exercise._id,
                            setIndex,
                            "weight",
                            e.target.value
                          )
                        }
                      />
                    </div>
                  )}
                  {exercise.category === "cardio" && (
                    <div className="column2">
                      <input
                        className="detailInp"
                        type="number"
                        placeholder="Duration (min)"
                        value={set.duration}
                        onChange={(e) =>
                          handleInputChange(
                            exercise._id,
                            setIndex,
                            "duration",
                            e.target.value
                          )
                        }
                      />
                      {/* <input
                        className="detailInp"
                        type="number"
                        placeholder="Distance (km)"
                        value={set.distance}
                        onChange={(e) =>
                          handleInputChange(
                            exercise._id,
                            setIndex,
                            "distance",
                            e.target.value
                          )
                        }
                      /> */}
                    </div>
                  )}
                  {exercise.category === "bodyweight" && (
                    <div className="column2">
                      <input
                        className="detailInp"
                        type="number"
                        placeholder="Reps"
                        value={set.reps}
                        onChange={(e) =>
                          handleInputChange(
                            exercise._id,
                            setIndex,
                            "reps",
                            e.target.value
                          )
                        }
                      />
                    </div>
                  )}
                  <button
                    className="removeBtn"
                    onClick={() => removeSet(exercise._id, setIndex)}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      height="24px"
                      viewBox="0 -960 960 960"
                      width="24px"
                      fill="#124559"
                    >
                      <path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
            <div className="center">
              <button
                className="add-set-button"
                onClick={() => addSet(exercise._id)}
              >
                Add Set
              </button>
            </div>
          </div>
        ))}
        <button className="saveBtn" onClick={saveWorkout}>
          Save Workout
        </button>
      </div>
    </div>
  );
}

export default MakeWorkout;