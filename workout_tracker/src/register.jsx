import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./login.css"; // Assuming this is your CSS file

function Register() {
  const API_URL = import.meta.env.VITE_API_BASE_URL;
  console.log("API_URL:", API_URL);

  const [firstName, setFirstName] = useState(""); // State for first name
  const [lastName, setLastName] = useState(""); // State for last name
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("user");
  const [trainerId, setTrainerId] = useState(null); // Store selected trainer's ID
  const [trainers, setTrainers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch the list of trainers when the component mounts
    axios
      .get(`${API_URL}/trainers`) // Get trainers from /api/trainers
      .then((res) => {
        setTrainers(res.data); // Update state with fetched trainers
      })
      .catch((err) => console.error("Error fetching trainers:", err));
  }, []);

  const handleSubmit = (e) => {
    console.log("handleSubmit triggered!");
    e.preventDefault();
    axios
      .post(`${API_URL}/register`, {
        firstName, // Send firstName
        lastName, // Send lastName
        email,
        password,
        phoneNumber: phone,
        role,
        trainerId: role === "user" ? (trainerId || null) : null, // Only send trainerId if the role is 'user'
      })
      .then((result) => {
        console.log(result);
        navigate("/login");
      })
      .catch((err) => console.error(err));
  };

  return (
    <div className="subPage">
      <div className="auth-card">
        <h1 className="heading" style={{ marginTop: "1vh" }}>
          Create Account
        </h1>
        {/* <p className="text" style={{ marginBottom: "1vh" }}>
          Sign Up!
        </p> */}

        <form onSubmit={handleSubmit}>

          <div className="label">
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#124559"><path d="M480-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47ZM160-160v-112q0-34 17.5-62.5T224-378q62-31 126-46.5T480-440q66 0 130 15.5T736-378q29 15 46.5 43.5T800-272v112H160Zm80-80h480v-32q0-11-5.5-20T700-306q-54-27-109-40.5T480-360q-56 0-111 13.5T260-306q-9 5-14.5 14t-5.5 20v32Zm240-320q33 0 56.5-23.5T560-640q0-33-23.5-56.5T480-720q-33 0-56.5 23.5T400-640q0 33 23.5 56.5T480-560Zm0-80Zm0 400Z" /></svg>          <p>Name</p>
          </div>
          <div className="column1" style={{ marginBottom: "0px" }}>
            <input
              type="text"
              placeholder="Enter First Name"
              autoComplete={"off"}
              onChange={(e) => setFirstName(e.target.value)} // Update firstName state
            />

            <input
              type="text"
              placeholder="Enter Last Name"
              autoComplete={"off"}
              onChange={(e) => setLastName(e.target.value)} // Update lastName state
            />
          </div>


          {/* Email Input */}
          <div className="label">
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#124559"><path d="M160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h640q33 0 56.5 23.5T880-720v480q0 33-23.5 56.5T800-160H160Zm320-280L160-640v400h640v-400L480-440Zm0-80 320-200H160l320 200ZM160-640v-80 480-400Z" /></svg>
            <p>Email</p>
          </div>
          <input
            type="email" // Use type="email" for email input
            placeholder="Enter Email"
            autoComplete="off"
            onChange={(e) => setEmail(e.target.value)}
          />

          {/* Phone Input */}
          <div className="label">
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#5f6368"><path d="M798-120q-125 0-247-54.5T329-329Q229-429 174.5-551T120-798q0-18 12-30t30-12h162q14 0 25 9.5t13 22.5l26 140q2 16-1 27t-11 19l-97 98q20 37 47.5 71.5T387-386q31 31 65 57.5t72 48.5l94-94q9-9 23.5-13.5T670-390l138 28q14 4 23 14.5t9 23.5v162q0 18-12 30t-30 12ZM241-600l66-66-17-94h-89q5 41 14 81t26 79Zm358 358q39 17 79.5 27t81.5 13v-88l-94-19-67 67ZM241-600Zm358 358Z" /></svg>
            <p>Phone</p>
          </div>
          <input
            type="tel" // Use type="tel" for phone input
            placeholder="Enter Phone Number"
            autoComplete="off"
            onChange={(e) => setPhone(e.target.value)}
          />

          {/* Password Input */}
          <div className="label">
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#124559"><path d="M240-80q-33 0-56.5-23.5T160-160v-400q0-33 23.5-56.5T240-640h40v-80q0-83 58.5-141.5T480-920q83 0 141.5 58.5T680-720v80h40q33 0 56.5 23.5T800-560v400q0 33-23.5 56.5T720-80H240Zm0-80h480v-400H240v400Zm240-120q33 0 56.5-23.5T560-360q0-33-23.5-56.5T480-440q-33 0-56.5 23.5T400-360q0 33 23.5 56.5T480-280ZM360-640h240v-80q0-50-35-85t-85-35q-50 0-85 35t-35 85v80ZM240-160v-400 400Z" /></svg>
            <p>Password</p>
          </div>
          <input
            type="password"
            placeholder="Enter Password"
            onChange={(e) => setPassword(e.target.value)}
          />

          {/* Role Selection */}
          <div className="column1" style={{ gap: "0vh" }}>
            <div>
              <div className="label">
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#5f6368"><path d="M40-160v-112q0-34 17.5-62.5T104-378q62-31 126-46.5T360-440q66 0 130 15.5T616-378q29 15 46.5 43.5T680-272v112H40Zm720 0v-120q0-44-24.5-84.5T666-434q51 6 96 20.5t84 35.5q36 20 55 44.5t19 53.5v120H760ZM360-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47Zm400-160q0 66-47 113t-113 47q-11 0-28-2.5t-28-5.5q27-32 41.5-71t14.5-81q0-42-14.5-81T544-792q14-5 28-6.5t28-1.5q66 0 113 47t47 113ZM120-240h480v-32q0-11-5.5-20T580-306q-54-27-109-40.5T360-360q-56 0-111 13.5T140-306q-9 5-14.5 14t-5.5 20v32Zm240-320q33 0 56.5-23.5T440-640q0-33-23.5-56.5T360-720q-33 0-56.5 23.5T280-640q0 33 23.5 56.5T360-560Zm0 320Zm0-400Z" /></svg>              <p>Role</p>
              </div>
              <select
                name="role"
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="user">User</option>
                <option value="trainer">Trainer</option>
              </select>
            </div>
            <br />

            {/* Trainer Selection (Conditional) */}
            {role === "user" && (
              <div>
                <div className="label">
                  <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#5f6368"><path d="M720-400v-120H600v-80h120v-120h80v120h120v80H800v120h-80Zm-360-80q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47ZM40-160v-112q0-34 17.5-62.5T104-378q62-31 126-46.5T360-440q66 0 130 15.5T616-378q29 15 46.5 43.5T680-272v112H40Zm80-80h480v-32q0-11-5.5-20T580-306q-54-27-109-40.5T360-360q-56 0-111 13.5T140-306q-9 5-14.5 14t-5.5 20v32Zm240-320q33 0 56.5-23.5T440-640q0-33-23.5-56.5T360-720q-33 0-56.5 23.5T280-640q0 33 23.5 56.5T360-560Zm0-80Zm0 400Z" /></svg>
                  <p>Select Trainer</p>
                </div>
                <select
                  name="trainer"
                  id="trainer"
                  value={trainerId}
                  onChange={(e) => setTrainerId(e.target.value || null)}
                >
                  <option value="">None</option>
                  {trainers.map((trainer) => (
                    <option key={trainer._id} value={trainer._id}>
                      {trainer.firstName} {trainer.lastName}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <button type="submit" className="btn">
            Create
          </button>

          <h3>
            Already have an Account? <a href="/login">Sign In</a>
          </h3>
        </form>
      </div>

    </div>
  );
}

export default Register;