import { useState, useEffect } from "react";
import axios from "axios";
import TrainerNav from "./TrainerNav";

function Exercises() {

    return (
        <>
            <div className="page">
                <h1 className="heading">Exercises</h1>
                <br />

            </div>

            <TrainerNav/>
        </>
    );
}

export default Exercises;