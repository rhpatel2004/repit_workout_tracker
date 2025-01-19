// import "./Profile.css";
import { useState, useEffect } from "react";
import axios from "axios";
import TrainerNav from "./TrainerNav";

function Dashboard() {

    return (
        <>
            <div className="page">
                <h1 className="heading">Dashboard</h1>
                <br />

            </div>

            <TrainerNav/>
        </>
    );
}

export default Dashboard;
