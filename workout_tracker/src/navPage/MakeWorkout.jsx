import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./MakeWorkout.css";
import ExerciseDetail from "./ExerciseDetail";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

function MakeWorkout() {
    const location = useLocation();
    const { workoutName: initialWorkoutName, selectedExercises: initialSelectedExercises } = location.state || {};
    const navigate = useNavigate();
    const [isEditable, setIsEditable] = useState(false);
    const [workoutName, setWorkoutName] = useState(initialWorkoutName || "My Workout");
    const [workoutNote, setWorkoutNote] = useState("");
    const inputRef = useRef(null);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [exercisesData, setExercisesData] = useState(initialSelectedExercises || []);

    useEffect(() => {
        if (initialWorkoutName) {
            setWorkoutName(initialWorkoutName);
        }
        if (initialSelectedExercises) {
            setExercisesData(initialSelectedExercises);
        }
    }, [initialWorkoutName, initialSelectedExercises]);

    const enableEdit = () => {
        setIsEditable(true);
        setTimeout(() => inputRef.current.focus(), 0);
    };

    const handleInputChange = (e) => {
        setWorkoutName(e.target.value);
    };

    const handleExerciseChange = (updatedExercises) => {
        setExercisesData(updatedExercises);
    };

    const handleSaveWorkout = async () => {
        const userId = localStorage.getItem("userId");
        const workoutData = {
            userId,
            workoutName,
            workoutNote,
            date: selectedDate,
            exercises: exercisesData
        };

        try {
            const response = await fetch("http://localhost:3001/saveWorkout", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(workoutData),
            });

            if (response.ok) {
                alert("Workout saved successfully!");
                navigate("/workout");
            } else {
                const errorData = await response.json();
                alert("Error saving workout: " + JSON.stringify(errorData));
            }
        } catch (error) {
            console.error("Error:", error);
        }
    };

    return (
        <div className="subPage">
            <div className="column">
                <button className="topButton" onClick={() => navigate("/workout")}>
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#124559"><path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"/></svg>
                </button>
            </div>

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
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#124559"><path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z"/></svg>
                </button>
            </div>
            <input
                type="text"
                className="notes"
                placeholder="Workout Note"
                value={workoutNote}
                onChange={(e) => setWorkoutNote(e.target.value)}
            />
            <div className="extra column">
                <p className="text">Select Date </p>
                <DatePicker className="picker"
                    selected={selectedDate}
                    onChange={(date) => setSelectedDate(date)}
                    dateFormat="dd/MM/yyyy"
                    placeholderText="Select Workout Date"
                />
            </div>

            <ExerciseDetail selectedExercises={exercisesData} onExerciseChange={handleExerciseChange} />

            <button className="subTickButton" onClick={handleSaveWorkout}>
            <svg className="tickText" xmlns="http://www.w3.org/2000/svg" height="40px" viewBox="0 -960 960 960" width="40px" fill="#EFF6E0"><path d="M379.33-244 154-469.33 201.67-517l177.66 177.67 378.34-378.34L805.33-670l-426 426Z"/></svg>
            </button>
        </div>
    );
}

export default MakeWorkout;
