import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import TrainerNav from './TrainerNav'; // Make sure path is correct
import '../navPage/Workout.css'; // Assuming styles are shared or create trainer.css

function Exercises() {
    const API_URL = import.meta.env.VITE_API_BASE_URL;
    const navigate = useNavigate();

    // State for filters, search, data, loading, errors
    const [selection, setSelection] = useState("All"); // Muscle group filter
    const [searchQuery, setSearchQuery] = useState("");
    const [exercises, setExercises] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [trainerId, setTrainerId] = useState(null); // Get trainer's ID

    // Get Trainer ID from localStorage
    useEffect(() => {
        const storedUserId = localStorage.getItem("userId"); // Assuming trainer ID is stored as userId
        const storedUserRole = localStorage.getItem("userRole");
        if (storedUserId && storedUserRole === "trainer") {
            setTrainerId(storedUserId);
        } else {
            console.error("Trainer ID/Role not found in storage.");
            // Optional: Redirect if not a logged-in trainer
            // navigate('/login'); 
        }
    }, []);

    // Handler for dropdown selection
    function handleSelect(event) {
        setSelection(event.target.value);
    }

    // Handler for search input
    function handleSearchChange(event) {
        setSearchQuery(event.target.value);
        // Consider adding Debouncing here for performance
    }

    // Fetch Exercises Effect
    useEffect(() => {
        // Only fetch if trainerId is loaded (or allow fetching public if desired)
        // if (!trainerId) return; 

        // Debounce Setup
        const debounceTimer = setTimeout(() => {
            const fetchData = async () => {
                console.log(`Workspaceing exercises - Filter: ${selection}, Search: "${searchQuery}"`);
                setLoading(true);
                setError(null);
                
                try {
                    const searchParam = encodeURIComponent(searchQuery);
                    // Using the same endpoint, pass trainerId for potential backend logic
                    const response = await axios.get(
                        `${API_URL}/exercises?muscleGroup=${selection}&trainerId=${trainerId || ''}&search=${searchParam}` 
                    );
                    
                    if (Array.isArray(response.data)) {
                        setExercises(response.data);
                    } else {
                        console.error("API did not return an array:", response.data);
                        setError(new Error("Received data is not an array."));
                        setExercises([]);
                    }
                } catch (error) {
                    console.error("Error fetching exercises:", error); 
                    setError(error);
                    setExercises([]);
                } finally {
                    setLoading(false);
                }
            };
            fetchData();
        }, 300); // 300ms delay

        return () => clearTimeout(debounceTimer);

    // Dependency array triggers refetch on change
    }, [selection, trainerId, searchQuery, API_URL]); 

    // Dropdown options - Removed "Your Exercises" as backend handles trainer-specific logic if needed
    const options = [
        { label: "All ", value: "All" },
        { label: "My Exercises", value: "trainer_private" }, 
        { label: "Chest", value: "Chest" },
        { label: "Back", value: "Back" },
        { label: "Shoulders", value: "Shoulders" },
        { label: "Legs", value: "Legs" },
        { label: "Biceps", value: "Biceps" },
        { label: "Triceps", value: "Triceps" },
        { label: "Core", value: "Core" },
        { label: "Cardio", value: "Cardio" },
    ];

    return (
        <>
            <div className="page">
                {/* Use standard heading */}
                <h1 className="heading" style={{ textAlign: 'left', marginBottom: '2.4rem' }}>Exercise Library</h1>

                {/* Search Input */}
                <div className="search-container">
                    <input 
                        type="search"
                        className="search-input"
                        placeholder="Search exercises by name..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                    />
                </div>

                {/* Filter Row */}
                <div className="column"> 
                    <p className="text">Filter by Muscle Group</p>
                    <select className="dropDown" onChange={handleSelect} value={selection}>
                        {options.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>

                 {/* Add Exercise Button - Reusing class from SelectExercises */}
                 <button
                    className="addNewWorkout " 
                    onClick={() => navigate("/trainerAddExercise")} // Navigate to trainer's form
                >
                    Add New Exercise
                </button>

                {/* Exercise List Display */}
                <div className="exercise-list-container">
                    {loading && <p>Loading exercises...</p>}
                    {error && <p className="error-message">Error fetching exercises: {error.message}</p>}
                    {!loading && !error && exercises.length === 0 && (
                        <p>No exercises found matching your criteria.</p>
                    )}
                    {!loading && !error && exercises.length > 0 && (
                        // Using basic list structure - reuse .exercise-card style
                        <div className='trainer-exercise-display-list'> 
                            {exercises.map((exercise) => (
                                // Using exercise-card class for styling consistency
                                // Not interactive like the selection page
                                <div key={exercise._id} className="exercise-card"> 
                                    <h3>{exercise.name}</h3>
                                    <p>
                                        {exercise.muscleGroup} | {exercise.equipment || 'N/A'} | {exercise.category}
                                    </p>
                                    {/* You could add description or an Edit/Delete button here */}
                                    {/* e.g., if (exercise.trainerId === trainerId) { <button>Edit</button> } */}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            <TrainerNav />
        </>
    );
}

export default Exercises;