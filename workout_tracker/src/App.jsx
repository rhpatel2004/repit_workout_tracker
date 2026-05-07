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
import Guide from "./Guide"
function App() {
  const location = useLocation();
  const isLandingPage = location.pathname === "/";
  const isAuthPage = ["/login", "/register", "/guide"].includes(location.pathname);

  return (
    <>
      {isLandingPage ? (
        <div className="landingpage">
          <LandingPage />
        </div>
      ) : (
        <div className={`App${isAuthPage ? " authApp" : ""}`}>
          <Routes>
            {/* --- Public Routes --- */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/guide" element={<Guide />} />

            {/* --- Protected User Routes --- */}
            <Route element={<ProtectedRoute allowedRoles={["user"]} />}>
              <Route path="/workout" element={<WorkoutPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/analysis" element={<AnalysisPage />} />
              <Route path="/selectExercises" element={<SelectExercises />} />
              <Route path="/defaultExercise" element={<DefaultExercise />} />
              <Route path="/makeWorkout" element={<MakeWorkout />} />
              <Route path="/customExercise" element={<CustomExercise />} />
            </Route>

            {/* --- Protected Trainer Routes --- */}
            <Route element={<ProtectedRoute allowedRoles={["trainer"]} />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/trainerProfile" element={<TrainerProfile />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/exercises" element={<Exercises />} />
              <Route path="/trainer/clients/:clientId/workouts" element={<ClientWorkoutHistory />} />
              <Route path="/trainerAddExercise" element={<TrainerAddExercise />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      )}
    </>
  );
}

export default App;
