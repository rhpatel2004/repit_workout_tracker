import React, { useState, useEffect } from "react";
import "./HistoryCard.css";
import axios from "axios";

function HistoryCard({ workout, onDelete }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [exerciseDetails, setExerciseDetails] = useState({});

  useEffect(() => {
    const fetchExerciseDetails = async () => {
      const details = {};
      for (const exercise of workout.exercises) {
        try {
          const response = await axios.get(`/api/exercise/${exercise.exerciseId}`);
          details[exercise.exerciseId] = response.data;
        } catch (error) {
          console.error("Error fetching exercise details:", error);
          details[exercise.exerciseId] = { name: 'Unknown Exercise' };
        }
      }
      setExerciseDetails(details);
    };

    if (workout.exercises.length > 0) {
      fetchExerciseDetails();
    }
  }, [workout.exercises]);

  const handleDeleteClick = (event) => {
    event.stopPropagation();
    onDelete(workout._id);
  };

  const toggleDetails = () => {
    setIsExpanded((prev) => !prev);
  };

  const date = new Date(workout.date);
  const options = { day: "numeric", month: "long" };
  const formattedDate = date.toLocaleDateString("en-GB", options);

  return (
    <div className="workoutCard" style={{ margin: "0" }}>
      <div
        className="column"
        onClick={toggleDetails}
        style={{ cursor: "pointer" }}
      >
        <div>
          <h3>{workout.name}</h3>
          <p>{formattedDate}</p>
        </div>
        <button className="plus" onClick={handleDeleteClick}>
        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#124559"><path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/></svg>
        </button>
      </div>

      {isExpanded && (
        <div className="workoutDetails">
          <h4>Workout Note</h4>
          {workout.notes ? (
            <p>{workout.notes}</p>
          ) : (
            <p>No notes available.</p>
          )}
          <h4>Exercises</h4>
          <ul>
            {workout.exercises.map((exercise) => {
              const exerciseDetail = exerciseDetails[exercise.exerciseId];
              return (
                <li key={exercise.exerciseId}>
                  <h4>{exercise.exerciseId.name || 'Exercise details not available'}</h4>
                  <ul>
                    {exercise.sets.map((set, setIndex) => (
                      <li key={setIndex}>
                        Set {setIndex + 1}:
                        {set.reps && <span> Reps: {set.reps},</span>}
                        {set.weight && <span> Weight: {set.weight} kgs,</span>}
                        {set.duration && <span> Duration: {set.duration} minutes,</span>}
                        {/* {set.distance && <span> Duration: {set.distance} km,</span>} */}
                        {set.restTime && <span> Rest Time: {set.restTime} seconds</span>}
                      </li>
                    ))}
                  </ul>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

export default HistoryCard;