import "./Profile.css";
import NavBar from "../NavBar";
import { useState, useEffect } from "react";
import axios from "axios";

function ProfilePage() {

    const API_URL = import.meta.env.VITE_API_BASE_URL;
    const [userData, setUserData] = useState({});
    const [error, setError] = useState(null);
    const userId = localStorage.getItem("userId");

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await axios.get(`${API_URL}/getUser/${userId}`);
                setUserData(response.data);
            } catch (error) {
                console.error("Error fetching user data:", error);
                setError(error);
            }
        };

        if (userId) {
            fetchUserData();
        }
    }, [userId]);

    const handleLogout = () => {
        localStorage.removeItem("userId");
        localStorage.removeItem("userRole");
        // Redirect to the login page or home page
        window.location.href = "/"; // or use navigate("/") if you are using react-router-dom
    };
    const getFullName = () => {
        if (userData.firstName && userData.lastName) {
            return `${userData.firstName} ${userData.lastName}`;
        } else if (userData.firstName) {
            return userData.firstName;
        } else if (userData.lastName) {
            return userData.lastName;
        } else {
            return ""; // Or return a default value like "User"
        }
    };

    const getTrainerFullName = () => {
        const trainer = userData.trainerId;
        if (trainer && trainer.firstName && trainer.lastName) {
            return `${trainer.firstName} ${trainer.lastName}`;
        }
        return "You have no trainer";
    };
    return (
        <>
            <div className="page">
                <div className="column">
                    <h1 className="heading">Profile</h1>
                </div>
              
                {error && <p className="error-message">Error: {error.message}</p>}

                <div className="center">
                    <img
                        src={userData.profilePictureUrl || "profileDemo.png"}
                        alt="Profile"
                        className="profileImage"
                    />
                </div>
                <div className="profileBox profile">


                    <div className="column1">
                        <p>Username</p>
                        <input
                            className="profileInfo"
                            type="text"
                            value={getFullName()}
                            name="username"
                            readOnly
                        />
                    </div>
                    <div className="column1">
                        <p>Email</p>
                        <input
                            className="profileInfo"
                            type="text"
                            value={userData.email || ""}
                            name="username"
                            readOnly
                        />
                    </div>
                    <div className="column1">
                        <p>Phone</p>
                        <input
                            className="profileInfo"
                            type="text"
                            value={userData.phoneNumber || ""}
                            name="username"
                            readOnly
                        />
                    </div>
                    <div className="column1">
                        <p>Role</p>
                        <input
                            className="profileInfo"
                            type="text"
                            value={userData.role || ""}
                            name="username"
                            readOnly
                        />
                    </div>
                    <div className="column1">
                        {userData.trainerId ? (
                            <p>Trainer</p>
                        ) : (
                            <p></p>
                        )}
                        {userData.trainerId ? (
                            <input
                                className="profileInfo"
                                type="text"
                                value={getTrainerFullName()}
                                readOnly
                            />
                        ) : (
                            <p></p>
                        )}
                    </div>
                </div>


                <button className="addNewWorkout logout" onClick={handleLogout}>
                    Log Out
                </button>
            </div>
            <NavBar />
        </>
    );
}

export default ProfilePage;