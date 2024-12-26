import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./MakeWorkout.css"
function SelectExercises() {
    const navigate = useNavigate();
    const [selection, setSelection] = useState("lower arms");
    const [exercises, setExercises] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);


    function handleSelect(event) {
        const selectedValue = event.target.value;
        setSelection(selectedValue);
        
    }


    useEffect(() => {

        const fetchData = async () => {
            setLoading(true);
            setError(null);
            setExercises([]);

            const url = `https://exercisedb.p.rapidapi.com/exercises/bodyPart/${selection}?limit=25&offset=0`;
            const options = {
                method: 'GET',
                headers: {
                    'x-rapidapi-key': '8fbb06ccfamsh776bca8f0c07631p1dd258jsnbb5a2f9f4387',
                    'x-rapidapi-host': 'exercisedb.p.rapidapi.com'
                }
            };

            try {
                const response = await fetch(url, options);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const result = await response.json();
                // console.log(result)
                setExercises(result);
            } catch (error) {
                setError(error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [selection]);

    const options = [

        { label: "Lower Arms", value: "lower arms" },
        { label: "Upper Arms", value: "upper arms" },
        { label: "Back", value: "back" },
        { label: "Chest", value: "chest" },
        { label: "Shoulders", value: "shoulders" },
        { label: "Lower legs", value: "lower legs" },
        { label: "Upper legs", value: "upper legs" },
        { label: "Cardio", value: "cardio" },

    ]
    const [selectedExercises, setSelectedExercises] = useState([]);

    const handleExerciseClick = (exerciseName) => {
        if (selectedExercises.includes(exerciseName)) {
            // If already selected, remove it from the array
            setSelectedExercises(selectedExercises.filter(name => name !== exerciseName));
           
        } else {
            // Otherwise, add it to the array
            setSelectedExercises([...selectedExercises, exerciseName]);
            
        }
    };

    const isSelected = (exerciseName) => selectedExercises.includes(exerciseName);


    return (
        <div className="subPage">
            <button className="topButton" onClick={() => navigate("/workout")}>
                <svg xmlns="http://www.w3.org/2000/svg" height="30px" viewBox="0 -960 960 960" width="30px" fill="#124559"><path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z" /></svg>
            </button>

            <h1 className="heading">Add Exercise</h1>
            <br />
            {/* <div className="column1">
                <input type="text" className="search-btn" placeholder="Search Exercise" />
                <button className="topButton" >
                    <svg xmlns="http://www.w3.org/2000/svg" height="30px" viewBox="0 -960 960 960" width="30px" fill="#124559"><path d="M784-120 532-372q-30 24-69 38t-83 14q-109 0-184.5-75.5T120-580q0-109 75.5-184.5T380-840q109 0 184.5 75.5T640-580q0 44-14 83t-38 69l252 252-56 56ZM380-400q75 0 127.5-52.5T560-580q0-75-52.5-127.5T380-760q-75 0-127.5 52.5T200-580q0 75 52.5 127.5T380-400Z" /></svg>
                </button>
            </div> */}
            <div className="column">
                <p className="text" style={{ margin: "20px 0" }}>Select Exercises</p>

                <select className="dropDown" onChange={handleSelect}>

                    {options.map(option => (
                        <option className="option" value={option.value}>{option.label}</option>
                    ))}

                </select>
            </div>

            <div>
                {loading && <p>Loading exercises...</p>}
                {error && <p>Error fetching exercises: {error.message}</p>}
                {!loading && !error && exercises.length === 0 && selection && (
                    <p>No exercises found for the selected muscle group.</p>
                )}
                {!loading && !error && exercises.length > 0 && (
                    <div>
                        {exercises.map((exercise, index) => (
                            <div
                                key={index}
                                className={`exercise-card ${isSelected(exercise.name) ? 'selected' : ''}`} 
                                style={{
                                    marginBottom: "2px",
                                    padding: "15px",
                                    // border: isSelected(exercise.name) ? "2px solid #0f5132" : "2px solid #ccc",
                                    backgroundColor: isSelected(exercise.name) ? "#d1e7dd" : "white",
                                    cursor: "pointer"
                                }}
                                onClick={() => handleExerciseClick(exercise.name)} 
                            >
                                <h3 style={{ letterSpacing: "1.5px" }}>{exercise.name}</h3>
                                <p>{exercise.bodyPart} | {exercise.equipment}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <button className="subTickButton" onClick={() => navigate("/makeWorkout", { state: { selectedExercises } })}>
                <svg className="tickText" xmlns="http://www.w3.org/2000/svg" height="40px" viewBox="0 -960 960 960" width="40px" fill="#EFF6E0"><path d="M379.33-244 154-469.33 201.67-517l177.66 177.67 378.34-378.34L805.33-670l-426 426Z" /></svg>
            </button>

        </div>
    )
}

export default SelectExercises