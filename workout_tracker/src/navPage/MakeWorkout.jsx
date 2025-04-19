// MakeWorkout.jsx
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import NavBar from "../NavBar";
import { useLocation, useNavigate } from "react-router-dom";
import "./MakeWorkout.css";

function MakeWorkout() {
  const API_URL = import.meta.env.VITE_API_BASE_URL;
  const location = useLocation();
  const navigate = useNavigate();
  const [exercises, setExercises] = useState([]);
  const [setsData, setSetsData] = useState({});
  const [userId, setUserId] = useState(null);
  const [workoutName, setWorkoutName] = useState("My Workout");
  const [isEditable, setIsEditable] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [workoutNote, setWorkoutNote] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const workoutNameInputRef = useRef(null);

  const clearWorkoutState = () => {
    console.log("Clearing workout state from sessionStorage");
    sessionStorage.removeItem('makeWorkoutSelections');
    sessionStorage.removeItem('makeWorkoutSetsData');
    sessionStorage.removeItem('makeWorkoutName');
    sessionStorage.removeItem('makeWorkoutNote');
    sessionStorage.removeItem('makeWorkoutDate');
    sessionStorage.removeItem('makeWorkoutStartTime');
  };

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    if (storedUserId) {
      setUserId(storedUserId);
    }

    // Restore or initialize state
    const storedExerciseIds = JSON.parse(sessionStorage.getItem('makeWorkoutSelections') || '[]');
    const storedSetsData = JSON.parse(sessionStorage.getItem('makeWorkoutSetsData') || '{}');
    const storedWorkoutName = sessionStorage.getItem('makeWorkoutName');
    const storedWorkoutNote = sessionStorage.getItem('makeWorkoutNote');
    const storedDate = sessionStorage.getItem('makeWorkoutDate');
    const storedStartTime = sessionStorage.getItem('makeWorkoutStartTime');

    // Use IDs passed from SelectExercises primarily, fall back to sessionStorage
    const currentExerciseIds = location.state?.selectedExercises || storedExerciseIds;

    if (currentExerciseIds.length > 0) {
      // Only fetch if there are IDs to fetch
      fetchExercisesDetails(currentExerciseIds);
      // Restore other data only if there were IDs (meaning a workout was in progress)
      if (storedExerciseIds.length > 0) {
        setSetsData(storedSetsData);
        if (storedWorkoutName) setWorkoutName(storedWorkoutName);
        if (storedWorkoutNote) setWorkoutNote(storedWorkoutNote);
        if (storedDate) setSelectedDate(new Date(storedDate));
        if (storedStartTime) setStartTime(new Date(parseInt(storedStartTime)));
        else setStartTime(new Date()); // Set start time if not restoring
      } else {
          //If no exerciseId are present then set start time to null.
          setStartTime(null);
      }
    } else {
      // If no IDs passed and none in storage, clear any lingering state
      clearWorkoutState();
      setStartTime(new Date()); // Start timer fresh
    }

    // Cleanup on component unmount *if not navigating to select more exercises*
    // This is tricky, maybe better to clear ONLY on explicit cancel/save
    // return () => {
    //   // Consider if you want to clear state when leaving this page for other reasons
    // };

  }, []); // Run only once on initial mount

  const fetchExercisesDetails = async (idsToFetch) => {
    if (!idsToFetch || idsToFetch.length === 0) {
        setExercises([]); // Clear exercises if no IDs
        return;
    };
    try {
      const exercisesDetails = await Promise.all(
        idsToFetch.map(async (id) => {
          const response = await axios.get(`${API_URL}/exercise/${id}`);
          return response.data;
        })
      );
      setExercises(exercisesDetails);
      // Don't re-initialize setsData here if restoring, handle in initializeSetsDataForNew
       initializeSetsDataForNew(exercisesDetails); // Initialize only if not restored
    } catch (error) {
      console.error("Error fetching exercise details:", error);
    }
  };

  // Initialize setsData only for exercises that don't have data yet
  const initializeSetsDataForNew = (fetchedExercises) => {
     setSetsData(prevSetsData => {
        const newSetsData = {...prevSetsData};
        fetchedExercises.forEach(exercise => {
            // Only initialize if this exercise ID doesn't exist in setsData yet
            if (!newSetsData[exercise._id]) {
                 newSetsData[exercise._id] = [{ reps: "", weight: "", duration: "", distance: "", restTime: "" }];
            }
        });
        return newSetsData;
     });
 };


  // --- Input Handlers (No change needed, they update state which is saved on navigate) ---
  const handleInputChange = (exerciseId, setIndex, field, value) => {
    setSetsData((prevSetsData) => {
        // Ensure the array exists before trying to map
        const currentSets = prevSetsData[exerciseId] || [];
        return {
            ...prevSetsData,
            [exerciseId]: currentSets.map((set, index) =>
                index === setIndex ? { ...set, [field]: value } : set
            ),
        };
    });
  };

  const addSet = (exerciseId) => {
    setSetsData((prevSetsData) => ({
      ...prevSetsData,
      [exerciseId]: [
        ...(prevSetsData[exerciseId] || []), // Ensure array exists
        { reps: "", weight: "", duration: "", distance: "", restTime: "" },
      ],
    }));
  };

  // *** MODIFIED removeSet Function ***
  const removeSet = (exerciseId, setIndex) => {
    setSetsData((prevSetsData) => {
      const currentSets = prevSetsData[exerciseId] || [];
      const updatedSets = currentSets.filter((_, index) => index !== setIndex);

      // Check if this was the last set for the exercise
      if (updatedSets.length === 0) {
        console.log(`Removing exercise ${exerciseId} as last set was deleted.`);

        // 1. Remove the exercise from the main 'exercises' state
        setExercises(prevExercises =>
          prevExercises.filter(ex => ex._id !== exerciseId)
        );

        // 2. Remove the exercise entry from setsData
        const { [exerciseId]: _, ...remainingSetsData } = prevSetsData; // Destructure to remove the key

        // 3. Update session storage for both selections and sets data
        const currentSelections = JSON.parse(sessionStorage.getItem('makeWorkoutSelections') || '[]');
        const newSelections = currentSelections.filter(id => id !== exerciseId);
        sessionStorage.setItem('makeWorkoutSelections', JSON.stringify(newSelections));
        sessionStorage.setItem('makeWorkoutSetsData', JSON.stringify(remainingSetsData));

        return remainingSetsData; // Return the state without the removed exercise key
      } else {
        // If sets still remain, just update the sets for this exercise
        const newSetsData = {
          ...prevSetsData,
          [exerciseId]: updatedSets,
        };
        sessionStorage.setItem('makeWorkoutSetsData', JSON.stringify(newSetsData)); // Save changes
        return newSetsData;
      }
    });
  };

  const handleWorkoutNameChange = (e) => {
    setWorkoutName(e.target.value);
  };

   const handleWorkoutNoteChange = (e) => {
    setWorkoutNote(e.target.value);
  };

   const handleDateChange = (e) => {
    const newDate = new Date(e.target.value + "T00:00:00");
    setSelectedDate(newDate);
  };

  const toggleEditWorkoutName = () => {
    setIsEditable(true);
  };

  useEffect(() => {
    if (isEditable && workoutNameInputRef.current) {
      workoutNameInputRef.current.focus();
    }
  }, [isEditable]);

  const handleBlur = () => {
    setIsEditable(false);
  };

   // --- Navigation and Saving ---

   // Renamed to reflect its purpose
   const goToAddExercises = () => {
       // Save current state before navigating
       sessionStorage.setItem('makeWorkoutSelections', JSON.stringify(exercises.map(ex => ex._id))); // Save current IDs
       sessionStorage.setItem('makeWorkoutName', workoutName);
       sessionStorage.setItem('makeWorkoutNote', workoutNote);
       sessionStorage.setItem('makeWorkoutDate', selectedDate.toISOString());
       sessionStorage.setItem('makeWorkoutSetsData', JSON.stringify(setsData));
       if (startTime) {
           sessionStorage.setItem('makeWorkoutStartTime', startTime.getTime().toString());
       }
       navigate('/selectExercises'); // Go back to selection page
   }

   // Function for the top-left back button
   const handleBackWorkout = () => {
      //  clearWorkoutState(); 
       navigate('/selectExercises'); 
   }
   const handleCancelWorkout = () => {
    // --- Add Confirmation ---
    if (window.confirm("Are you sure you want to cancel this workout? Your progress will be lost.")) {
        // User clicked OK
        clearWorkoutState(); // Clear the session storage
        navigate('/workout'); // Navigate back to the main workout page
    } else {
        // User clicked Cancel - do nothing
        console.log("Workout cancellation aborted.");
    }
  };


  const saveWorkout = async () => {
    const endTime = new Date();
    const calculatedDuration = startTime ? Math.round((endTime - startTime) / (1000 * 60)) : 0;

    const workoutData = {
      userId: userId,
      workoutTemplateId: null,
      name: workoutName,
      date: selectedDate,
      duration: calculatedDuration,
      notes: workoutNote,
      exercises: exercises.map((exercise) => ({
        exerciseId: exercise._id,
        // Filter out empty sets before saving
        sets: (setsData[exercise._id] || []).filter(set => {
            if (exercise.category === 'strength') return (set.reps !== '' && set.reps !== null) || (set.weight !== '' && set.weight !== null);
            if (exercise.category === 'cardio') return (set.duration !== '' && set.duration !== null) || (set.distance !== '' && set.distance !== null);
            if (exercise.category === 'bodyweight') return (set.reps !== '' && set.reps !== null);
            return false;
        })
      })).filter(exercise => exercise.sets.length > 0), // Remove exercises with no valid sets
      isTemplate: false,
    };

    // Basic Validation
    if (!workoutData.name) {
        alert("Please enter a workout name.");
        return;
    }
    if (workoutData.exercises.length === 0) {
        alert("Please log details for at least one exercise set.");
        return;
    }

    try {
      const response = await axios.post(
        `${API_URL}/saveWorkout`,
        workoutData
      );
      console.log("Workout saved successfully:", response.data);
      alert("Workout saved successfully!");
      clearWorkoutState(); // Clear stored state after successful save
      navigate("/history");
    } catch (error) {
      console.error("Error saving workout:", error);
      alert("Failed to save workout. Please try again.");
    }
  };


  return (
    <div className="page"> {/* Changed from subPage based on your SelectExercises */}
      <div className="column">
        <h1 className="heading">
          {/* --- MODIFIED Back Button --- */}
          <button className="topButton" onClick={handleBackWorkout}>
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
          ref={workoutNameInputRef} // Assign ref
          type="text"
          className="workoutName"
          value={workoutName}
          onChange={handleWorkoutNameChange}
          readOnly={!isEditable}
          onBlur={handleBlur} // Handle losing focus
        />
        <button className="edit" onClick={toggleEditWorkoutName}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="24px" // Matched size
            viewBox="0 -960 960 960"
            width="24px" // Matched size
            fill="#124559"
          >
            <path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z" />
          </svg>
        </button>
      </div>

      {/* Workout Note Input */}
      <div className="noteDiv"> {/* Changed from noteDiv for consistency? */}
        <p className="text">Workout Note</p>
        <textarea
          className="notes"
          placeholder="Enter workout notes here..."
          value={workoutNote}
          onChange={handleWorkoutNoteChange}
        />
      </div>

      {/* Date Selection */}
      <div className="beside">
        <p className="text">Date</p>
        <input
          className="picker"
          type="date"
          value={selectedDate.toISOString().slice(0, 10)}
          onChange={handleDateChange} // Use specific handler
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
                        placeholder="Weight (kg)" // Added unit
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
                      <input
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
                      />
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
        <div className="add-exercise-button-area">
          <button
            className="add-exercise-button"
            onClick={goToAddExercises}
          >
            Add Exercise
          </button>
        </div>
        <button className="cancelBtn" onClick={handleCancelWorkout}>
          Cancel Workout
        </button>
        <button className="saveBtn" onClick={saveWorkout}>
          Save Workout
        </button>
      </div>
    </div>
  );
}

export default MakeWorkout;