import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import CreateFolder from "../component/CreateFolder"; // Ensure this path is correct


function DefaultExercise() {
  const navigate = useNavigate();
  const [selection, setSelection] = useState("All");
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedExercises, setSelectedExercises] = useState([]);
  const [templateName, setTemplateName] = useState("New Template");
  const inputRef = useRef(null); // Ref for the template name input
  const [isEditable, setIsEditable] = useState(false); // *** Start as NOT editable ***
  const [userId, setUserId] = useState(null);
  const [folders, setFolders] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState(""); // "" for Uncategorized
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [searchQuery, setSearchQuery] = useState(""); // *** State for search query ***

  const API_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    if (storedUserId) {
      setUserId(storedUserId);
    } else {
      navigate('/login');
    }
  }, [navigate]);

  // Fetch Folders
  useEffect(() => {
    const fetchFolders = async () => {
      if (!userId) return;
      try {
        const response = await axios.get(`${API_URL}/folders?userId=${userId}`);
        setFolders(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error("Error fetching folders:", error);
      }
    };
    fetchFolders();
  }, [userId, API_URL]);

  // Fetch Exercises - Now includes search query
  useEffect(() => {
    if (!userId) return;

    // Debouncing for search
    const debounceTimer = setTimeout(() => {
      const fetchData = async () => {
        setLoading(true); setError(null); setExercises([]);
        try {
          const searchParam = encodeURIComponent(searchQuery); // Encode search query
          const response = await axios.get(
            `${API_URL}/exercises?muscleGroup=${selection}&userId=${userId}&search=${searchParam}` // Add search param
          );
          setExercises(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
          setError(error); setExercises([]);
        } finally { setLoading(false); }
      };
      fetchData();
    }, 300); // 300ms delay

    return () => clearTimeout(debounceTimer); // Cleanup timeout

  }, [selection, userId, searchQuery, API_URL]); // Add searchQuery dependency

  function handleSelect(event) { setSelection(event.target.value); }

  // *** Modified enableEdit: Only sets editable to true, focus handled by useEffect ***
  const enableEdit = () => {
    setIsEditable(true);
  };

  // *** Effect to focus input when it becomes editable ***
  useEffect(() => {
    if (isEditable && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select(); // Optional: Select text on focus
    }
  }, [isEditable]);


  const handleBlur = () => { setIsEditable(false); } // Disable editing when input loses focus
  const handleTemplateNameChange = (e) => { setTemplateName(e.target.value); }; // Renamed for clarity

  // *** Handler for search input changes ***
  function handleSearchChange(event) {
    setSearchQuery(event.target.value);
  }

  const handleExerciseClick = (exercise) => {
    const exerciseId = exercise._id;
    setSelectedExercises(prev =>
      prev.includes(exerciseId) ? prev.filter(id => id !== exerciseId) : [...prev, exerciseId]
    );
  };
  const isSelected = (exerciseId) => selectedExercises.includes(exerciseId);

  const handleFolderCreated = async () => {
    setShowCreateFolder(false);
    if (!userId) return;
    try {
      const response = await axios.get(`${API_URL}/folders?userId=${userId}`);
      setFolders(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error refetching folders:", error);
    }
  };

  const handleAddCustomExerciseClick = () => {
    sessionStorage.setItem('customExerciseReturnPath', '/defaultExercise');
    // Navigate to custom exercise page
    navigate("/customExercise");
    
  };

  const saveTemplate = async () => {
    if (!templateName.trim()) { alert("Please enter a template name."); return; }
    if (selectedExercises.length === 0) { alert("Please select at least one exercise."); return; }

    const newTemplate = {
      userId: userId,
      name: templateName,
      exercises: selectedExercises,
      folderId: selectedFolder || null,
    };

    try {
      const response = await axios.post(`${API_URL}/workout-templates`, newTemplate);
      alert("Template saved successfully!");
      navigate("/workout");
    } catch (error) {
      console.error("Error saving template:", error);
      alert(`Failed to save template: ${error.response?.data?.message || error.message}`);
    }
  };
  const options = [
    { label: "All", value: "All" },
    { label: "Your Exercises", value: "custom" },
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
    <div className="subPage">
      <h1 className="heading">
        <button className="topButton" onClick={() => navigate("/workout")}>
          {/* Back Arrow SVG */}
          <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#124559"><path d="M400-80 0-480l400-400 71 71-329 329 329 329-71 71Z" /></svg>
        </button>
        Create Template
      </h1>
      <button className="subTickButton" onClick={saveTemplate}>
        <svg className="tickText" xmlns="http://www.w3.org/2000/svg" height="40px" viewBox="0 -960 960 960" width="40px" fill="#EFF6E0"><path d="M379.33-244 154-469.33 201.67-517l177.66 177.67 378.34-378.34L805.33-670l-426 426Z" /></svg>
      </button>

      <div className="beside">
        <input
          ref={inputRef} // Assign ref
          type="text"
          className="workoutName"
          value={templateName}
          onChange={handleTemplateNameChange} // Use correct handler
          readOnly={!isEditable} // Start as read-only
          onBlur={handleBlur} // Disable edit on blur
          placeholder="Template Name"
        />
        {/* Edit button triggers editing */}
        <button className="topButton" onClick={enableEdit}>
          <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#124559"><path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z" /></svg>
        </button>
      </div>
      {/* Folder Selection */}
      <div className="folder-selection-container"> {/* Use beside class */}
        <label htmlFor="folder-select" className="text">Save to Folder:</label>
        <div className="column"> {/* Nested div to keep select and button together */}
          <select
            id="folder-select"
            className="dropDown"
            value={selectedFolder || ""}
            onChange={(e) => setSelectedFolder(e.target.value || null)}
          >
            <option value="">My Templates</option>
            {folders.map((folder) => (
              <option key={folder._id} value={folder._id}>
                {folder.name}
              </option>
            ))}
          </select>
          <button className="plus" onClick={() => setShowCreateFolder(true)} title="Create New Folder">
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#757575"><path d="M160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h240l80 80h320q33 0 56.5 23.5T880-640v400q0 33-23.5 56.5T800-160H160Zm0-80h640v-400H447l-80-80H160v480Zm0 0v-480 480Z" /></svg>
          </button>
        </div>
      </div>

      {/* Create Folder Modal */}
      {showCreateFolder && (
        <CreateFolder userId={userId} onFolderCreated={handleFolderCreated} onClose={() => setShowCreateFolder(false)} />
      )}

      {/* *** Search Input Added *** */}
      <div className="search-container">
        <input
          type="search"
          className="search-input"
          placeholder="Search exercises by name..."
          value={searchQuery}
          onChange={handleSearchChange}
        />
      </div>

      <div className="column">
        <p className="text">Select Exercises</p>
        <select className="dropDown" onChange={handleSelect} value={selection}>
          {options.map((option) => (
            <option key={option.value} className="option" value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* *** Add Custom Exercise Button *** */}
      <button
        className="addNewWorkout" // Reuse style or create new
        onClick={handleAddCustomExerciseClick} // Navigate to your custom exercise creation page
      >
        Add Custom Exercise
      </button>


      <div className="exercise-list-container">
        {loading && <p>Loading exercises...</p>}
        {error && <p>Error fetching exercises: {error.message}</p>}
        {!loading && !error && exercises.length === 0 && (
          <p>No exercises found.</p>
        )}
        {!loading && !error && exercises.length > 0 && (
          <div>
            {exercises.map((exercise) => (
              <div
                key={exercise._id}
                className={`exercise-card ${isSelected(exercise._id) ? "selected" : ""}`}
                style={{/* your styles */ }}
                onClick={() => handleExerciseClick(exercise)}
              >
                <h3 style={{ letterSpacing: "1.5px" }}>{exercise.name}</h3>
                <p>{exercise.muscleGroup} | {exercise.equipment}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default DefaultExercise;