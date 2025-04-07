// App.jsx
import React from 'react'; // Removed unnecessary state checks from App
import './App.css';
import { Route, Routes, Navigate, useLocation } from "react-router-dom";

// Import Pages/Components
import LandingPage from "./LandingPage";
import Login from "./login";
import Register from "./register";
import WorkoutPage from "./navPage/Workout";
import ProfilePage from "./navPage/Profile";
import HistoryPage from "./navPage/History";
import AnalysisPage from "./navPage/Analysis";
import SelectExercises from "./navPage/SelectExercises";
import DefaultExercise from "./navPage/DefaultExercise";
import MakeWorkout from "./navPage/MakeWorkout";
import Dashboard from "./trainerPage/Dashboard";
import Leaderboard from "./trainerPage/Leaderboard";
import Exercises from "./trainerPage/Exercises";
import TrainerProfile from "./trainerPage/TrainerProfile";
import ClientWorkoutHistory from "./trainerPage/ClientWorkoutHistory";
import ProtectedRoute from "./ProtectedRoute"; // Import ProtectedRoute
import CustomExercise from "./component/CustomExercise";
import TrainerAddExercise from "./component/TrainerAddExercise"

function App() {

  return (
    <>
      <h1 className="DesktopHead">Only available for Mobile</h1>
      <div className="landingpage">
        <Routes>
          <Route path="/" element={<LandingPage />} />
        </Routes>
      </div>
      <div className="App">
        <Routes>
          {/* --- Public Routes --- */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* --- Protected User Routes --- */}
          {/* All routes nested inside will be checked for "user" role */}
          <Route element={<ProtectedRoute allowedRoles={["user"]} />}>
            <Route path="/workout" element={<WorkoutPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/analysis" element={<AnalysisPage />} />
            <Route path="/selectExercises" element={<SelectExercises />} />
            <Route path="/defaultExercise" element={<DefaultExercise />} />
            <Route path="/makeWorkout" element={<MakeWorkout />} />
            <Route path="/customExercise" element={<CustomExercise />} />
            {/* Add other user-only routes here */}
          </Route>

          {/* --- Protected Trainer Routes --- */}
          {/* All routes nested inside will be checked for "trainer" role */}
          <Route element={<ProtectedRoute allowedRoles={["trainer"]} />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/trainerProfile" element={<TrainerProfile />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/exercises" element={<Exercises />} />
            <Route path="/trainer/clients/:clientId/workouts" element={<ClientWorkoutHistory />} />
            <Route path="/trainerAddExercise" element={<TrainerAddExercise />} />
            {/* Add other trainer-only routes here */}
          </Route>

          {/* Optional: Catch-all route for unmatched paths */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
        {/* NO Global NavBars here - they are inside individual pages */}
      </div>
    </>
  );
}

export default App;