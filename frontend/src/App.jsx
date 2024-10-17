import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import HomePage from "./HomePage";
import LoginForm from "./Login";
import Booking from "./Booking"
import About from "./About"

function App(){
    return(
        <Router>
            <div className="App">
                <Routes>
                    <Route path="/" element={<HomePage />}/>
                    <Route path="/Login" element={<LoginForm />}/>
                    <Route path="/Booking" element={<Booking />}/>
                    <Route path="/About" element={<About />}/>
                </Routes>
            </div>
        </Router>
    );
}

export default App;
