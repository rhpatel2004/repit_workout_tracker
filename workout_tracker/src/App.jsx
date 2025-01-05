import NavBar from "./NavBar"
import './App.css'
import { Route, Routes } from "react-router-dom"
import WorkoutPage from "./navPage/Workout"
import ProfilePage from "./navPage/Profile"
import HistoryPage from "./navPage/History"
import AnalysisPage from "./navPage/Analysis"
import SelectExercises from "./navPage/SelectExercises"
import DefaultExercise from "./navPage/DefaultExercise"
import MakeWorkout from "./navPage/MakeWorkout"
import Login from "./login"
import Register from "./register"
import ResetPassword from "./ResetPassword"
function App() {

  return (
    <>      <h1 className="DesktopHead">Only available for Mobile</h1>
    <div className="App">
      <Routes>
        <Route path="/workout" element={<WorkoutPage />} />
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/analysis" element={<AnalysisPage />} />
        <Route path="/selectExercises" element={<SelectExercises />} />
        <Route path="/defaultExercise" element={<DefaultExercise />} />
        <Route path="/makeWorkout" element={<MakeWorkout />} />
        <Route path="/reset-password" element={<ResetPassword />} />



      </Routes>
      
    </div>
    </>

  )
}

export default App
