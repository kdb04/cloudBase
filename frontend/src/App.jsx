import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import HomePage from "./HomePage";
import LoginForm from "./Login";
import Booking from "./Booking"
import About from "./About";
import ContactPage from "./contact";

function App(){
    const [isLoggedIn, setIsLoggenIn] = useState(false);

    const handleLogin = () => {
        setIsLoggenIn(true);
    };

    return(
        <Router>
            <div className="App">
                <Routes>
                    <Route path="/" element={<HomePage />}/>
                    <Route path="/Login" element={<LoginForm />}/>
                    <Route path="/Booking" element={<Booking />}/>
                    <Route path="/About" element={<About />}/>
                    <Route path="/contact" element={<ContactPage />}/>
                </Routes>
            </div>
        </Router>
    );
}

export default App;
