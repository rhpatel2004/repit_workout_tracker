import WorkoutCard from "./WorkoutCard";
import { useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import "./Workout.css";
import NavBar from "../NavBar";
import axios from "axios";

function WorkoutPage() {
    const navigate = useNavigate();
    const [userId, setUserId] = useState(null);
    const [defaultWorkouts, setDefaultWorkouts] = useState([]);

    useEffect(() => {
        const storedUserId = localStorage.getItem("userId");
        if (storedUserId) {
            setUserId(storedUserId);
        }
    }, []);

    useEffect(() => {
        const fetchDefaultWorkouts = async () => {
            if (!userId) return;
            try {
                const response = await axios.get(
                    `http://localhost:3001/api/getDefaultWorkouts/${userId}`
                );
                setDefaultWorkouts(response.data);
            } catch (error) {
                console.error("Error fetching default workouts:", error);
            }
        };

        fetchDefaultWorkouts();
    }, [userId]);

    const handleWorkoutClick = workout => {
        navigate("/makeWorkout", {
            state: {
                workoutName: workout.workoutName,
                selectedExercises: workout.exercises,
            },
        });
    };

    const handleDelete = workoutId => {
        // Optimistically update the UI
        setDefaultWorkouts(prevWorkouts =>
            prevWorkouts.filter(workout => workout._id !== workoutId)
        );

        // Call API to delete the workout
        axios
            .delete(`http://localhost:3001/api/deleteDefaultWorkout/${workoutId}`)
            .then(response => {
                console.log(response.data.message); // Log success message
            })
            .catch(error => {
                console.error(
                    "Error deleting workout:",
                    error.response ? error.response.data : error.message
                );
            });
    };

    return (
        <>
            <div className="page">
                <h1 className="heading">Workouts</h1>
                <button
                    className="addNewWorkout"
                    onClick={() => navigate("/selectExercises")}
                >
                    Add New Workout
                </button>
                <div className="column">
                    <p className="text">Select your default workout</p>
                    <button className="plus" onClick={() => navigate("/defaultExercise")}>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            height="30px"
                            viewBox="0 -960 960 960"
                            width="30px"
                            fill="#598392"
                        >
                            <path d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z" />
                        </svg>
                    </button>
                </div>
                {defaultWorkouts.map(workout => (
                    <div key={workout._id} onClick={() => handleWorkoutClick(workout)}>
                        <WorkoutCard
                            key={workout._id}
                            workoutId={workout._id}
                            workoutName={workout.workoutName}
                            exercises={workout.exercises}
                            onDelete={handleDelete}
                        />
                    </div>
                ))}
            </div>
            <NavBar />
        </>
    );
}

export default WorkoutPage;