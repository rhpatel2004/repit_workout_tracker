import React, { useState, useEffect } from "react";
import axios from "axios";
import NavBar from "../NavBar";
import { useLocation, useNavigate } from "react-router-dom";

function MakeWorkout() {
    const location = useLocation();
    const navigate = useNavigate();
    const selectedExerciseIds = location.state?.selectedExercises || [];
    const [exercises, setExercises] = useState([]);
    const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
    const [setsData, setSetsData] = useState({});
    const [userId, setUserId] = useState(null);
    const [workoutName, setWorkoutName] = useState("My Workout");
    const [isEditable, setIsEditable] = useState(false);

    useEffect(() => {
        const storedUserId = localStorage.getItem("userId");
        if (storedUserId) {
            setUserId(storedUserId);
        }

        if (selectedExerciseIds.length > 0) {
            fetchExercisesDetails();
        }
    }, [selectedExerciseIds]);

    const fetchExercisesDetails = async () => {
        try {
            const exercisesDetails = await Promise.all(
                selectedExerciseIds.map(async (id) => {
                    const response = await axios.get(`http://localhost:3001/api/exercise/${id}`);
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
        exercisesDetails.forEach(exercise => {
            newSetsData[exercise._id] = exercise.sets && exercise.sets.length > 0 ?
                exercise.sets.map(set => ({
                    reps: set.reps || '',
                    weight: set.weight || '',
                    duration: set.duration || '',
                    restTime: set.restTime || ''
                })) :
                [{ reps: '', weight: '', duration: '', restTime: '' }];
        });
        setSetsData(newSetsData);
    };

    const handleInputChange = (exerciseId, setIndex, field, value) => {
        setSetsData(prevSetsData => ({
            ...prevSetsData,
            [exerciseId]: prevSetsData[exerciseId].map((set, index) =>
                index === setIndex ? { ...set, [field]: value } : set
            )
        }));
    };

    const addSet = (exerciseId) => {
        setSetsData(prevSetsData => ({
            ...prevSetsData,
            [exerciseId]: [...prevSetsData[exerciseId], { reps: '', weight: '', duration: '', restTime: '' }]
        }));
    };

    const removeSet = (exerciseId, setIndex) => {
        setSetsData(prevSetsData => ({
            ...prevSetsData,
            [exerciseId]: prevSetsData[exerciseId].filter((_, index) => index !== setIndex)
        }));
    };

    const goToNextExercise = () => {
        if (currentExerciseIndex < exercises.length - 1) {
            setCurrentExerciseIndex(currentExerciseIndex + 1);
        } else {
            console.log("Workout complete!");
        }
    };

    const handleWorkoutNameChange = (e) => {
        setWorkoutName(e.target.value);
    };

    const toggleEditWorkoutName = () => {
        setIsEditable(!isEditable);
    };

    const saveWorkout = async () => {
        const workoutData = {
          userId: userId,
          workoutTemplateId: null, // Set workoutTemplateId to null for custom workouts
          name: workoutName,
          date: new Date(),
          duration: 0, // You might want to calculate this based on start/end time
          notes: "", // Get this from user input if you have a notes field
          exercises: exercises.map(exercise => ({
            exerciseId: exercise._id,
            sets: setsData[exercise._id] || []
          })),
          isTemplate: false
        };
      
        try {
          const response = await axios.post('http://localhost:3001/api/saveWorkout', workoutData);
          console.log('Workout saved successfully:', response.data);
          alert("Workout saved successfully!");
          navigate("/history");
        } catch (error) {
          console.error('Error saving workout:', error);
          // Handle error appropriately, possibly by displaying an error message to the user
          if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.error("Data:", error.response.data);
            console.error("Status:", error.response.status);
            console.error("Headers:", error.response.headers);
            alert(`Failed to save workout: ${error.response.data.message}`);
          } else if (error.request) {
            // The request was made but no response was received
            console.error("No response received:", error.request);
            alert("Failed to save workout: No response from server");
          } else {
            // Something happened in setting up the request that triggered an Error
            console.error("Error", error.message);
            alert(`Failed to save workout: ${error.message}`);
          }
        }
      };

    const currentExercise = exercises[currentExerciseIndex];

    return (
        <div className="page">
            <div className="column">
                <h1 className="heading">Create Workout</h1>
            </div>

            <div className="edit-name-input">
                <input
                    type="text"
                    className="workoutName"
                    value={workoutName}
                    onChange={handleWorkoutNameChange}
                    readOnly={!isEditable}
                />
                <button className="edit-name-button" onClick={toggleEditWorkoutName}>
                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#124559">
                        <path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z" />
                    </svg>
                </button>
            </div>

            <div className="content-container">
                {exercises.length > 0 && (
                    <>
                        <h3 className="exercise-name">{currentExercise.name}</h3>
                        <div className="sets-container">
                            {setsData[currentExercise._id]?.map((set, setIndex) => (
                                <div key={setIndex} className="set-detail">
                                    <h4 className="set-heading">Set {setIndex + 1}</h4>
                                    {currentExercise.category === 'strength' && (
                                        <div className="input-group">
                                            <input
                                                type="number"
                                                placeholder="Reps"
                                                value={set.reps}
                                                onChange={(e) => handleInputChange(currentExercise._id, setIndex, 'reps', e.target.value)}
                                            />
                                            <input
                                                type="number"
                                                placeholder="Weight"
                                                value={set.weight}
                                                onChange={(e) => handleInputChange(currentExercise._id, setIndex, 'weight', e.target.value)}
                                            />
                                        </div>
                                    )}
                                    {currentExercise.category === 'cardio' && (
                                        <div className="input-group">
                                            <input
                                                type="number"
                                                placeholder="Duration (minutes)"
                                                value={set.duration}
                                                onChange={(e) => handleInputChange(currentExercise._id, setIndex, 'duration', e.target.value)}
                                            />
                                            <input
                                                type="number"
                                                placeholder="Distance (km)"
                                                value={set.distance}
                                                onChange={(e) => handleInputChange(currentExercise._id, setIndex, 'distance', e.target.value)}
                                            />
                                        </div>
                                    )}
                                    {currentExercise.category === 'bodyweight' && (
                                        <div className="input-group">
                                            <input
                                                type="number"
                                                placeholder="Reps"
                                                value={set.reps}
                                                onChange={(e) => handleInputChange(currentExercise._id, setIndex, 'reps', e.target.value)}
                                            />
                                        </div>
                                    )}
                                    <button className="remove-set-button" onClick={() => removeSet(currentExercise._id, setIndex)}>Remove Set</button>
                                </div>
                            ))}
                        </div>

                        <button className="add-set-button" onClick={() => addSet(currentExercise._id)}>Add Set</button>
                        <button className="next-exercise-button" onClick={goToNextExercise}>
                            {currentExerciseIndex < exercises.length - 1 ? 'Next Exercise' : 'Complete Workout'}
                        </button>
                        {currentExerciseIndex === exercises.length - 1 && (
                            <button className="save-workout-button" onClick={saveWorkout}>Save Workout</button>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default MakeWorkout;