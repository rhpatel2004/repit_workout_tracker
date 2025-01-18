import React, { useEffect, useState } from "react";
import axios from "axios";
import HistoryCard from "./HistoryCard";
import NavBar from "../NavBar";

function HistoryPage() {
    const [workouts, setWorkouts] = useState([]);
    const userId = localStorage.getItem("userId");

    useEffect(() => {
        if (userId) {
            axios
                .get(`http://localhost:3001/api/getWorkouts/${userId}`)
                .then(response => {
                    setWorkouts(response.data);
                })
                .catch(error => {
                    console.error("Error fetching workouts:", error);
                });
        }
    }, [userId]);

    const handleDelete = workoutId => {
        // Optimistically update the UI
        setWorkouts(prevWorkouts =>
            prevWorkouts.filter(workout => workout._id !== workoutId)
        );

        axios
            .delete(`http://localhost:3001/api/deleteWorkout/${workoutId}`)
            .then(response => {
                console.log(response.data.message);
            })
            .catch(error => {
                console.error(
                    "Error deleting workout:",
                    error.response ? error.response.data : error.message
                );
                // You might want to revert the UI change if the delete fails.
            });
    };

    return (
        <>
            <div className="page">
                <div className="column">
                    <h1 className="heading">History</h1>
                </div>
                <div className="cardSpace">
                    {workouts.map(workout => (
                        <HistoryCard
                            key={workout._id}
                            workout={workout}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            </div>
            <NavBar />
        </>
    );
}

export default HistoryPage;