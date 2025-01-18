import "./Profile.css";
import NavBar from "../NavBar";
import { useState, useEffect } from "react";
import axios from "axios";

function ProfilePage() {
    const [userData, setUserData] = useState({}); 
    const userId = localStorage.getItem("userId"); 
    const [isDarkMode, setIsDarkMode] = useState(false); 


    useEffect(() => {
        if (userId) {
            axios.get(`http://localhost:3001/api/getUser/${userId}`)
                .then(response => {
                    setUserData(response.data); 
                })
                .catch(err => {
                    console.error("Error fetching user data:", err);
                });
        }
    }, [userId]);

    const toggleDarkMode = () => {
        const newTheme = isDarkMode ? "light" : "dark";
        setIsDarkMode(!isDarkMode);
        localStorage.setItem("theme", newTheme);
        document.documentElement.setAttribute("data-theme", newTheme);
    };

    return (
        <>
        <div className="page">
            <div className="column">
                <h1 className="heading">Profile</h1>
                <button className="topButton darkmode" onClick={toggleDarkMode}>
                    <svg xmlns="http://www.w3.org/2000/svg" height="30px" viewBox="0 -960 960 960" width="30px" fill="#124559">
                        <path d="M480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm40-83q119-15 199.5-104.5T800-480q0-123-80.5-212.5T520-797v634Z" />
                    </svg>
                </button>
            </div>
            <br />
            <p>Username</p>
            <input className="input" type="text" value={userData.name || ""} readOnly /> 

            <p>Email</p>
            <input className="input" type="text" value={userData.email || ""} readOnly /> 

            <div className="column">
                <div>
                    <p>Weight</p>
                    <input className="input" type="number" value={userData.weight || 60} readOnly /> 
                </div>
                <div>
                    <p>Height</p>
                    <input className="input" type="text" value={userData.height || "170cm"} readOnly /> 
                </div>
            </div>
        </div>
            <NavBar />
            </>
    );
}

export default ProfilePage;
