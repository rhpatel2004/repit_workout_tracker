import React, { useState, useEffect } from "react";
import "./HistoryCard.css";
import axios from "axios";

// Accept onDelete as an optional prop
function HistoryCard({ workout, onDelete }) {
  const [isExpanded, setIsExpanded] = useState(false);
  // Removed exerciseDetails state and related useEffect - assuming data is populated by parent

  const handleDeleteClick = (event) => {
    event.stopPropagation(); // Prevent card toggle

    // --- Add Confirmation ---
    if (window.confirm("Are you sure you want to delete this workout history? This action cannot be undone.")) {
         // User clicked OK
         if (onDelete) { // Check if onDelete prop exists
            onDelete(workout._id); // Call the delete function passed from HistoryPage
         }
    } else {
        // User clicked Cancel - do nothing
        console.log("Workout deletion aborted.");
    }
    // -----------------------
};

  const toggleDetails = () => {
    setIsExpanded((prev) => !prev);
  };

  const date = new Date(workout.date);
  const options = { day: "numeric", month: "long" };
  const formattedDate = date.toLocaleDateString("en-GB", options);

  return (
    <div className="workoutCard" style={{ margin: "0" }} data-expanded={isExpanded}>
      <div
        className="column"
        onClick={toggleDetails}
        style={{ cursor: "pointer" }}
      >
        <div>
          {/* Use optional chaining in case workout name is missing */}
          <h3>{workout?.name || "Unnamed Workout"}</h3>
          <p>{formattedDate}</p>
        </div>
        {/* Conditionally render the delete button ONLY if onDelete prop is provided */}
        {onDelete && (
          <button className="plus" onClick={handleDeleteClick}>
            <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#124559">
              <path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z" />
            </svg>
          </button>
        )}
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
            {/* Use optional chaining for safety */}
            {workout.exercises?.map((exercise) => (
              <li key={exercise.exerciseId?._id || exercise._id}> {/* Use populated ID if available */}
                <h4>
                  {/* Access populated name directly */}
                  {exercise.exerciseId?.name || 'Unknown Exercise'}
                </h4>
                <ul>
                  {Array.isArray(exercise.sets) && exercise.sets.map((set, setIndex) => (
                    <li key={setIndex}>
                      Set {setIndex + 1}:
                      {set.reps != null && <span> Reps: {set.reps},</span>}
                      {set.weight != null && <span> Weight: {set.weight} kgs,</span>}
                      {set.duration != null && <span> Duration: {set.duration} minutes,</span>}
                      {set.distance != null && <span> Distance: {set.distance} km,</span>}
                      {set.restTime != null && <span> Rest Time: {set.restTime} seconds</span>}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default HistoryCard;