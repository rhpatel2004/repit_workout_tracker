import React, { useEffect, useState } from "react";
import axios from "axios";
import HistoryCard from "./HistoryCard";
import NavBar from "../NavBar";

function HistoryPage() {
  const API_URL = import.meta.env.VITE_API_BASE_URL || "/api";

  const [workouts, setWorkouts] = useState([]);
  const [error, setError] = useState("");
  const userId = localStorage.getItem("userId");

  const fetchWorkouts = async () => {
    try {
      setError("");

      if (!userId) {
        setWorkouts([]);
        return;
      }

      const response = await axios.get(`${API_URL}/getWorkouts/${userId}`);
      const workoutList = Array.isArray(response.data) ? response.data : [];

      if (!Array.isArray(response.data)) {
        console.error("Unexpected workouts response:", response.data);
        setError("Unable to load workout history right now.");
      }

      setWorkouts(workoutList);
    } catch (error) {
      console.error("Error fetching workouts:", error);
      setWorkouts([]);
      setError("Failed to load workout history.");
    }
  };

  useEffect(() => {
    fetchWorkouts();
  }, [userId, API_URL]);

  const handleDelete = async (workoutId) => {
    try {
      // Optimistically update the UI
      setWorkouts((prevWorkouts) =>
        prevWorkouts.filter((workout) => workout._id !== workoutId)
      );

      const response = await axios.delete(
        `${API_URL}/deleteWorkout/${workoutId}`
      );
      console.log(response.data.message);
    } catch (error) {
      console.error(
        "Error deleting workout:",
        error.response ? error.response.data : error.message
      );
      // Re-fetch workouts to revert the UI in case of an error
      await fetchWorkouts();
    }
  };

  return (
    <>
      <div className="page">
        <div className="column">
          <h1 className="heading">History</h1>
        </div>
        <div className="cardSpace">
          {error && <p>{error}</p>}
          {workouts.map((workout) => (
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
