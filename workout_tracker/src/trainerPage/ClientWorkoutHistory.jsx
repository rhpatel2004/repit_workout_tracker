import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import HistoryCard from "../navPage/HistoryCard"; 

function ClientWorkoutHistory() {
  const API_URL = import.meta.env.VITE_API_BASE_URL;

  const navigate = useNavigate();
  const { clientId } = useParams(); // Get the client ID from the URL params
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [clientName, setClientName] = useState(""); // Add state for client's name


  useEffect(() => {
    const fetchWorkouts = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(
          `${API_URL}/getWorkouts/${clientId}`
        );
        
        setWorkouts(response.data);
      } catch (error) {
        console.error("Error fetching workouts:", error);
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkouts();
  }, [clientId]);

  const handleGoBack = () => {
    navigate("/dashboard"); // Go back to the dashboard
  };

  return (
    <div className="subPage">
      
      <h2 className="clientHeading">
      <button className="topButton" onClick={handleGoBack}>
      <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#124559"><path d="M400-80 0-480l400-400 71 71-329 329 329 329-71 71Z"/></svg>    
      </button>Client Workout History 
      </h2>

      {loading && <p>Loading workouts...</p>}
      {error && <p>Error: {error.message}</p>}

      {!loading && !error && (
        <div className="cardSpace">
          {workouts.length > 0 ? (
            workouts.map((workout) => (
              <HistoryCard key={workout._id} workout={workout} />
            ))
          ) : (
            <p>No workouts found for this client.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default ClientWorkoutHistory;