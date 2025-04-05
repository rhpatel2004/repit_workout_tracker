import React, { useState } from "react";
import "./login.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Login() {
    const [email, setEmail] = useState(""); // Initialize with empty string
    const [password, setPassword] = useState(""); // Initialize with empty string
    const navigate = useNavigate();
    const API_URL = import.meta.env.VITE_API_BASE_URL;
    const handleSubmit = (e) => {
        e.preventDefault();
        axios
            .post(`${API_URL}/login`, { email, password })
            .then((result) => {
                console.log("Login Response:", result);
                if (result.data.message === "Success") {
                    localStorage.setItem("userId", result.data.userId);
                    const userRole = result.data.role; // Get the role
                    localStorage.setItem("userRole", userRole); // Store the role

                    // Redirect based on role
                    if (userRole === "trainer") {
                        navigate("/dashboard");
                    } else {
                        navigate("/workout");
                    }
                } else {
                    alert("Incorrect email or password.");
                }
            })
            .catch((err) => {
                console.error("Login error:", err);
                alert("Login failed. Please try again later.");
            });
    };



    return (
        <>
            <div className="subPage">
                <h1 className="heading" style={{ marginTop: "5vh" }}>
                    Log In
                </h1>
                <p className="text" style={{ marginBottom: "5vh" }}>
                    Welcome!!
                </p>

                <form onSubmit={handleSubmit}>
                    <div className="label">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            height="30px"
                            viewBox="0 -960 960 960"
                            width="30px"
                            fill="#124559"
                        >
                            <path d="M160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h640q33 0 56.5 23.5T880-720v480q0 33-23.5 56.5T800-160H160Zm320-280L160-640v400h640v-400L480-440Zm0-80 320-200H160l320 200ZM160-640v-80 480-400Z" />
                        </svg>
                        <p>Email</p>
                    </div>
                    <input
                        type="email" // Use type="email" for email input
                        placeholder="Enter Email"
                        autoComplete="off"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />

                    <div className="label">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            height="30px"
                            viewBox="0 -960 960 960"
                            width="30px"
                            fill="#124559"
                        >
                            <path d="M240-80q-33 0-56.5-23.5T160-160v-400q0-33 23.5-56.5T240-640h40v-80q0-83 58.5-141.5T480-920q83 0 141.5 58.5T680-720v80h40q33 0 56.5 23.5T800-560v400q0 33-23.5 56.5T720-80H240Zm0-80h480v-400H240v400Zm240-120q33 0 56.5-23.5T560-360q0-33-23.5-56.5T480-440q-33 0-56.5 23.5T400-360q0 33 23.5 56.5T480-280ZM360-640h240v-80q0-50-35-85t-85-35q-50 0-85 35t-35 85v80ZM240-160v-400 400Z" />
                        </svg>
                        <p>Password</p>
                    </div>
                    <input
                        type="password"
                        placeholder="Enter Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <br />
                    <br />
                    <button type="submit" className="btn">
                        Log In
                    </button>

                    <h3>
                        Don't have an Account? <a href="/register">Create</a>
                    </h3>
                </form>
            </div>
        </>
    );
}

export default Login;