import { useState } from "react";
import "./ExerciseDetail.css";

const ExerciseDetail = ({ selectedExercises, onExerciseChange }) => {
    // Initialize state to store sets, reps, and weights for each exercise
    const [exercisesData, setExercisesData] = useState(
        selectedExercises.map(exercise => ({
            name: exercise,
            sets: [
                { setNumber: 1, reps: 0, weight: 0 },
                { setNumber: 2, reps: 0, weight: 0 },
                { setNumber: 3, reps: 0, weight: 0 }
            ]
        }))
    );

    // Handle changes for sets, reps, and weight inputs
    const handleSetChange = (exerciseIndex, setIndex, field, value) => {
        const updatedExercises = [...exercisesData];
        updatedExercises[exerciseIndex].sets[setIndex][field] = value;
        setExercisesData(updatedExercises);
        onExerciseChange(updatedExercises);
    };

    return (
        <div>
            {exercisesData.map((exercise, exerciseIndex) => (
                <div className="detailBox" key={exerciseIndex}>
                    <h3 className="detailHead">{exercise.name}</h3>

                    {exercise.sets.map((set, setIndex) => (
                        <div className="column" key={set.setNumber}>
                            <h3 className="detailHead">Set {set.setNumber}</h3>
                            <div className="horizon">
                                <input
                                    type="number"
                                    value={set.weight}
                                    onChange={(e) => handleSetChange(exerciseIndex, setIndex, 'weight', e.target.value)}
                                    
                                />
                                <h3 className="kg">kg</h3>
                            </div>
                            <div className="horizon">
                                <input
                                    type="number"
                                    value={set.reps}
                                    onChange={(e) => handleSetChange(exerciseIndex, setIndex, 'reps', e.target.value)}
                                    
                                />
                                <h3 className="kg">reps</h3>
                            </div>
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
};

export default ExerciseDetail;
