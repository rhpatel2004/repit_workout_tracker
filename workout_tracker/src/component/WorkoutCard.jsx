import React from 'react';
import './WorkoutCard.css'; // Create or use an existing CSS file

// Assuming you might want a delete icon
import { FaTrashAlt } from "react-icons/fa";

// Props expected:
// - workoutName (String): Name of the template
// - exercises (Array): Array of exercise objects (populated with at least name)
// - templateId (String): The _id of the template
// - onDelete (Function): Function to call when delete button is clicked
// - onClick (Function): Function to call when the card itself is clicked (to start workout)

function WorkoutCard({ workoutName, exercises = [], templateId, onDelete, onClick }) {

    const handleDeleteClick = (event) => {
        event.stopPropagation(); // Prevent triggering onClick of the card
        if (onDelete) {
             // Ask for confirmation before deleting
             if (window.confirm(`Are you sure you want to delete the template "${workoutName}"?`)) {
                onDelete(templateId);
             }
        } else {
            console.warn("onDelete prop not provided to WorkoutCard for template:", templateId);
        }
    };

    const handleCardClick = () => {
        if (onClick) {
            onClick(); // Call the onClick handler passed from WorkoutPage
        } else {
            console.log("Clicked template card, but no onClick handler provided:", workoutName);
        }
    };

    return (
        <div className="workoutCard template-card" onClick={handleCardClick}>
            <div className="workoutCard-header column"> {/* Reusing 'column' for layout */}
                <h3>{workoutName || "Unnamed Template"}</h3>
                {/* Delete button */}
                <button className="plus delete-template-btn" onClick={handleDeleteClick} title="Delete Template">
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#124559"><path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/></svg>                </button>
            </div>
            <div className="template-exercises">
                <h4>Exercises:</h4>
                {Array.isArray(exercises) && exercises.length > 0 ? (
                    <ul>
                        {exercises.map((exerciseItem, index) => (
                            <li key={exerciseItem.exerciseId?._id || index}>
                                {exerciseItem.exerciseId?.name || "Unknown Exercise"}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No exercises in this template.</p>
                )}
            </div>
        </div>
    );
}

export default WorkoutCard;