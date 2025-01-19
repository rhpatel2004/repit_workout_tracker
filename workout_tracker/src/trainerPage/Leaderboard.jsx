import { useState, useEffect } from "react";
import axios from "axios";
import TrainerNav from "./TrainerNav";

function Leaderboard() {

    return (
        <>
            <div className="page">
                <h1 className="heading">Leaderboard</h1>
                <br />

            </div>

            <TrainerNav/>
        </>
    );
}

export default Leaderboard;