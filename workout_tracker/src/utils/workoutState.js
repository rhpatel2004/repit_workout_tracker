export const clearMakeWorkoutSessionState = () => {
    console.log("Clearing makeWorkout session storage state...");
    sessionStorage.removeItem('makeWorkoutSelections');
    sessionStorage.removeItem('makeWorkoutSetsData');
    sessionStorage.removeItem('makeWorkoutName');
    sessionStorage.removeItem('makeWorkoutNote');
    sessionStorage.removeItem('makeWorkoutDate');
    sessionStorage.removeItem('makeWorkoutStartTime');
  };