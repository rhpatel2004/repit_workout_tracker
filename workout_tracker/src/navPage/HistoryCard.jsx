import React, { useState } from "react";
import "./HistoryCard.css";

function HistoryCard({ workout, onDelete }) {
    const [isExpanded, setIsExpanded] = useState(false);

    const handleDeleteClick = event => {
        event.stopPropagation(); // Prevent event bubbling
        onDelete(workout._id); // Call onDelete from props (HistoryPage's handleDelete)
    };

    const toggleDetails = () => {
        setIsExpanded(prev => !prev);
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
                    <h3>{workout.workoutName}</h3>
                    <p>{formattedDate}</p>
                </div>
                <button className="plus" onClick={handleDeleteClick}>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        height="20px"
                        viewBox="0 -960 960 960"
                        width="20px"
                        fill="#124559"
                    >
                        <path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z" />
                    </svg>
                </button>
            </div>

            {isExpanded && (
                <div className="workoutDetails">
                    <h4>Workout Note</h4>
                    {workout.workoutNote ? (
                        <p>{workout.workoutNote}</p>
                    ) : (
                        <p>No notes available.</p>
                    )}
                    <h4>Exercises</h4>
                    <ul>
                        {workout.exercises.map(exercise => (
                            <li key={exercise._id}>
                                <h4>{exercise.name}</h4>
                                <ul>
                                    {exercise.sets.map((set, setIndex) => (
                                        <li key={setIndex}>
                                            Set {set.setNumber}: {set.reps} reps at {set.weight} kgs
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