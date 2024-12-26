import axios from 'axios';

function WorkoutCard({ workoutId, workoutName, exercises, onDelete }) {
  const handleDeleteClick = event => {
    event.stopPropagation(); // Prevent parent div's click event

    // Call onDelete (which is the handleDelete from WorkoutPage)
    onDelete(workoutId);
  };

  return (
    <div className="workoutCard">
      <div className="column">
        <h4>{workoutName}</h4>
        <button className="plus" onClick={handleDeleteClick}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="30px"
            viewBox="0 -960 960 960"
            width="20px"
            fill="#124559"
          >
            <path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z" />
          </svg>
        </button>
      </div>
      <ul>
        {exercises && exercises.length > 0 ? (
          exercises.map((exercise, index) => <li key={index}>{exercise}</li>)
        ) : (
          <li>No exercises selected</li>
        )}
      </ul>
    </div>
  );
}

export default WorkoutCard;