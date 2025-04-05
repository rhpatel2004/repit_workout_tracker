import { useState, useEffect } from "react";
import axios from "axios";
import TrainerNav from "./TrainerNav";
import HistoryCard from "../navPage/HistoryCard";
import { Link } from 'react-router-dom';
import "./trainer.css"

function Dashboard() {
    const API_URL = import.meta.env.VITE_API_BASE_URL;
    const [clients, setClients] = useState([]);
    const [selectedClient, setSelectedClient] = useState(null); // State for selected client ID
    const [selectedClientWorkouts, setSelectedClientWorkouts,] = useState([]); // State for selected client's workouts
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [trainerId, setTrainerId] = useState(null);

    useEffect(() => {
        const storedUserId = localStorage.getItem("userId");
        const storedUserRole = localStorage.getItem("userRole");
        if (storedUserId && storedUserRole === "trainer") {
            setTrainerId(storedUserId);
        }
    }, []);

    useEffect(() => {
        const fetchClients = async () => {
            try {
                const response = await axios.get(
                    `${API_URL}/trainer/clients?trainerId=${trainerId}`
                );

                if (Array.isArray(response.data)) {
                    setClients(response.data);
                } else {
                    console.error("API did not return an array:", response.data);
                    setError(new Error("Received data is not an array."));
                    setClients([]);
                }
            } catch (error) {
                console.error("Error fetching clients:", error);
                setError(error);
                setClients([]);
            } finally {
                setLoading(false);
            }
        };

        if (trainerId) {
            fetchClients();
        }
    }, [trainerId]);

    // Handle clicking on a client
    const handleClientClick = async (clientId) => {
        setSelectedClient(clientId); // Set the selected client's ID
        setLoading(true); // Start loading indicator
        setError(null); // Clear any previous errors

        try {
            const response = await axios.get(
                `${API_URL}/getWorkouts/${clientId}`
            ); // Fetch workouts using client ID directly
            // Ensure the response is an array before setting the state
            if (Array.isArray(response.data)) {
                setSelectedClientWorkouts(response.data);
            } else {
                console.error("API did not return an array for workouts:", response.data);
                setError(new Error("Received workout data is not an array."));
                setSelectedClientWorkouts([]); // Reset to empty array on error
            }
        } catch (error) {
            console.error("Error fetching workouts for client:", error);
            setError(error);
            setSelectedClientWorkouts([]); // Reset to empty array on error
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="page">
                <h1 className="heading">Your Trainees</h1>

                <div className="dashboard-content">
                    {loading && <p>Loading clients...</p>}
                    {error && <p>Error: {error.message}</p>}

                    {/* Client List */}
                    <div className="client-list">
                        {/* <h2 className="smallHeading">Clients</h2> */}
                        {clients.length > 0 ? (
                            <ul>
                                {clients.map((client) => (
                                    <Link to={`/trainer/clients/${client._id}/workouts`} 
                                    key={client._id}
                                    style={{ textDecoration: 'none', color: 'inherit' }} >
                                        <div className="workoutCard" key={client._id}>
                                            {client.profilePictureUrl && (
                                                <img
                                                    src={client.profilePictureUrl}
                                                    alt={`${client.firstName} ${client.lastName}`}
                                                    style={{
                                                        width: 50,
                                                        height: 50,
                                                        borderRadius: "50%",
                                                        marginRight: "10px",
                                                    }}
                                                />
                                            )}
                                            <p>{client.firstName} {client.lastName}</p>
                                        </div>
                                    </Link>
                                ))}
                            </ul>
                        ) : (
                            <p>No clients found.</p>
                        )}
                    </div>

                </div>
            </div>
            <TrainerNav />
        </>
    );
}
export default Dashboard;