import "./Profile.css";
import NavBar from "../NavBar";
import { useState, useEffect } from "react";
import axios from "axios";
import { uploadImageToCloudinary } from "../utils/cloudinaryUpload";

function ProfilePage() {
    const fallbackProfileImage = "profileDemo.png";

    const API_URL = import.meta.env.VITE_API_BASE_URL || "/api";
    const [userData, setUserData] = useState({});
    const [error, setError] = useState(null);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
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

    const handlePhotoChange = async (event) => {
        const file = event.target.files?.[0];

        if (!file || !userId) {
            return;
        }

        try {
            setUploadingPhoto(true);
            setError(null);

            const photoUrl = await uploadImageToCloudinary(file);
            const response = await axios.put(`${API_URL}/users/${userId}/profile-photo`, {
                profilePictureUrl: photoUrl,
            });

            setUserData(response.data.user);
        } catch (uploadError) {
            console.error("Error uploading profile photo:", uploadError);
            setError(uploadError);
        } finally {
            setUploadingPhoto(false);
            event.target.value = "";
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("userId");
        localStorage.removeItem("userRole");
        // Redirect to the login page or home page
        window.location.href = "/login"; // or use navigate("/") if you are using react-router-dom
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

    const getJoinedDate = () => {
        if (!userData.createdAt) {
            return "";
        }

        return new Date(userData.createdAt).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };
    return (
        <>
            <div className="page">
                <div className="column">
                    <h1 className="heading">Profile</h1>
                </div>
              
                {error && <p className="error-message">Error: {error.message}</p>}

                <div className="center">
                    <div className="profileImageSection">
                        <div className="profileAvatarWrap">
                            <img
                                src={userData.profilePictureUrl || fallbackProfileImage}
                                alt="Profile"
                                className="profileImage"
                                onError={(event) => {
                                    event.currentTarget.onerror = null;
                                    event.currentTarget.src = fallbackProfileImage;
                                }}
                            />
                            <input
                                id="profile-photo-input"
                                className="profileFileInput"
                                type="file"
                                accept="image/*"
                                onChange={handlePhotoChange}
                            />
                            <label
                                htmlFor="profile-photo-input"
                                className={`profileEditButton${uploadingPhoto ? " is-disabled" : ""}`}
                                aria-disabled={uploadingPhoto}
                            >
                                {uploadingPhoto ? (
                                    <span className="profileEditStatus">...</span>
                                ) : (
                                    <svg viewBox="0 0 24 24" aria-hidden="true" className="profileEditIcon">
                                        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25Zm17.71-10.04a1.003 1.003 0 0 0 0-1.42l-2.5-2.5a1.003 1.003 0 0 0-1.42 0l-1.96 1.96 3.75 3.75 2.13-1.79Z" />
                                    </svg>
                                )}
                            </label>
                        </div>
                        {uploadingPhoto && (
                            <div className="profileUploadHint">Uploading photo...</div>
                        )}
                    </div>
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
                        <p>Joined</p>
                        <input
                            className="profileInfo"
                            type="text"
                            value={getJoinedDate()}
                            name="joinedDate"
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


                <button className="profile-logout-btn" onClick={handleLogout}>
                    Log Out
                </button>
            </div>
            <NavBar />
        </>
    );
}

export default ProfilePage;
