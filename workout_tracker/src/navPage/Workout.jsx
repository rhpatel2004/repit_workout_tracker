import { useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import "./Workout.css";
import NavBar from "../NavBar";
import axios from "axios";
import WorkoutCard from "../component/WorkoutCard"; // Adapt this for TEMPLATES
import CreateFolder from "../component/CreateFolder"; // Your folder creation component
// Assuming you don't need clearMakeWorkoutSessionState here anymore,
// as "Start New Workout" should always be fresh via SelectExercises
// import { clearMakeWorkoutSessionState } from "../utils/workoutState";

function WorkoutPage() {
    const navigate = useNavigate();
    const [userId, setUserId] = useState(null);
    const [folders, setFolders] = useState([]);
    const [templates, setTemplates] = useState([]);
    // State to track which folder's templates are currently expanded/shown
    // Store the ID of the expanded folder, or 'uncategorized', or null if none
    const [expandedFolderId, setExpandedFolderId] = useState('uncategorized'); // Show uncategorized by default
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showCreateFolder, setShowCreateFolder] = useState(false);

    const API_URL = import.meta.env.VITE_API_BASE_URL;

    useEffect(() => {
        const storedUserId = localStorage.getItem("userId");
        if (storedUserId) {
            setUserId(storedUserId);
        } else {
            setLoading(false);
            navigate('/login');
        }
    }, [navigate]);

    // Fetch Folders and Templates
    useEffect(() => {
        if (userId) {
            fetchData();
        }
    }, [userId]); // Fetch when userId is available

    const fetchData = async () => {
        if (!userId) return;
        setLoading(true);
        setError(null);
        // Keep expanded folder state unless explicitly changed
        // setSelectedFolderId(null); // Don't reset here anymore
        try {
            const [foldersResponse, templatesResponse] = await Promise.all([
                axios.get(`${API_URL}/folders?userId=${userId}`),
                axios.get(`${API_URL}/workout-templates?userId=${userId}`)
            ]);
            setFolders(Array.isArray(foldersResponse.data) ? foldersResponse.data : []);
            setTemplates(Array.isArray(templatesResponse.data) ? templatesResponse.data : []);
        } catch (error) {
            console.error("Error fetching data:", error);
            setError(error);
            setFolders([]);
            setTemplates([]);
        } finally {
            setLoading(false);
        }
    };

    // Toggle which folder's templates are shown
    const handleFolderClick = (folderId) => {
        // If clicking the already expanded folder, collapse it (show nothing expanded)
        // Otherwise, expand the clicked folder
        setExpandedFolderId(prevId => prevId === folderId ? null : folderId);
    };

     const handleShowUncategorized = () => {
        // If uncategorized is already shown, collapse it, otherwise show it
        setExpandedFolderId(prevId => prevId === 'uncategorized' ? null : 'uncategorized');
     };

    const handleAddNewTemplateClick = () => {
        navigate("/defaultExercise");
    };

    const handleFolderCreated = () => {
        setShowCreateFolder(false);
        fetchData();
    };

    const handleDeleteTemplate = async (templateId) => {
        if (!window.confirm("Are you sure you want to delete this template?")) return;
        try {
            await axios.delete(`${API_URL}/workout-templates/${templateId}`, { data: { userId } });
            alert('Template deleted successfully!');
            fetchData(); // Refetch templates after deletion
        } catch (error) {
            console.error("Error deleting template:", error);
            alert(`Failed to delete template: ${error.response?.data?.message || error.message}`);
        }
    };

    const handleStartWorkoutFromTemplate = (template) => {
        console.log("Starting workout from template:", template.name);
         navigate("/makeWorkout", {
             state: {
                 selectedExercises: template.exercises.map(ex => ex.exerciseId?._id || ex.exerciseId),
                 workoutName: template.name // Pre-fill workout name
             },
         });
     };

    if (loading && !userId) return <div className="page"><p>Checking login...</p><NavBar /></div>;
    if (loading && userId) return <div className="page"><p>Loading...</p><NavBar /></div>;
    if (error) return <div className="page"><p>Error loading data: {error.message}</p><NavBar /></div>;
    if (!userId) return null;

    return (
        <>
            <div className="page">
                <h1 className="heading">Workouts</h1>

                {/* Your "Start New Workout" Button */}
                <button
                    className="addNewWorkout"
                    onClick={() => {
                        // clearMakeWorkoutSessionState(); // Clear state if starting completely fresh
                        navigate("/selectExercises");
                    }}
                >
                    Start New Workout
                </button>

                {/* Your Templates/Folders Header Section */}
                <div className="column1">
                    <p className="text">Templates</p>
                    <div className="btn-column" > 
                        <button className="plus" onClick={handleAddNewTemplateClick} title="Create New Template">
                             <svg xmlns="http://www.w3.org/2000/svg" height="40px" viewBox="0 -960 960 960" width="40px" fill="#598392">
                                 <path d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z" />
                            </svg>
                        </button>
                        <button className="plus" onClick={() => setShowCreateFolder(true)} title="Create New Folder">
                        <svg xmlns="http://www.w3.org/2000/svg" height="40px" viewBox="0 -960 960 960" width="40px" fill="#757575"><path d="M160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h240l80 80h320q33 0 56.5 23.5T880-640v400q0 33-23.5 56.5T800-160H160Zm0-80h640v-400H447l-80-80H160v480Zm0 0v-480 480Z"/></svg>                        </button>
                    </div>
                </div>

                {/* Create Folder Modal */}
                 {showCreateFolder && (
                    <CreateFolder userId={userId} onFolderCreated={handleFolderCreated} onClose={() => setShowCreateFolder(false)} />
                 )}

                {/* Folder and Template Display Area */}
                <div className="folder-template-area">

                    {/* Uncategorized Section */}
                    <div className="folder-section">
                        <div
                            className={`folder-header ${expandedFolderId === 'uncategorized' ? 'selected' : ''}`}
                            onClick={handleShowUncategorized}
                        >
                            <h3>My Templates</h3>
                        </div>
                        {/* Show templates only if 'Uncategorized' is expanded */}
                        {expandedFolderId === 'uncategorized' && (
                            <div className="template-grid">
                                {templates.filter(t => !t.folderId).length > 0 ? (
                                    templates.filter(t => !t.folderId).map((template) => (
                                        <WorkoutCard
                                            key={template._id}
                                            workoutName={template.name}
                                            exercises={template.exercises}
                                            templateId={template._id}
                                            onDelete={() => handleDeleteTemplate(template._id)}
                                            onClick={() => handleStartWorkoutFromTemplate(template)}
                                        />
                                    ))
                                ) : (
                                    <p className="no-templates-message">No uncategorized templates.</p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* User-Created Folders */}
                    {folders.map((folder) => (
                        <div key={folder._id} className="folder-section">
                            <div
                                className={`folder-header ${expandedFolderId === folder._id ? 'selected' : ''}`}
                                onClick={() => handleFolderClick(folder._id)}
                            >
                                <h3>{folder.name}</h3>
                                {/* Add Edit/Delete folder icons here */}
                            </div>
                            {/* Show templates only if this folder is expanded */}
                            {expandedFolderId === folder._id && (
                                <div className="template-grid">
                                    {templates.filter(t => t.folderId?.toString() === folder._id.toString()).length > 0 ? (
                                        templates
                                            .filter(template => template.folderId?.toString() === folder._id.toString())
                                            .map((template) => (
                                                <WorkoutCard
                                                    key={template._id}
                                                    workoutName={template.name}
                                                    exercises={template.exercises}
                                                    templateId={template._id}
                                                    onDelete={() => handleDeleteTemplate(template._id)}
                                                    onClick={() => handleStartWorkoutFromTemplate(template)}
                                                />
                                        ))
                                    ) : (
                                        <p className="no-templates-message">No templates in this folder.</p>
                                    )}
                                </div>
                             )}
                        </div>
                     ))}
                </div>

            </div>
            <NavBar />
        </>
    );
}

export default WorkoutPage;