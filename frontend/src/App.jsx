import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import HomePage from "./HomePage";
import LoginForm from "./Login";
import Booking from "./Booking"
import About from "./About";
import ContactPage from "./contact";
import AdminPage from "./AdminPage";

function App(){
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userEmail, setUserEmail] = useState("");

    const handleLogin = (email) => {
        setIsLoggedIn(true);
        setUserEmail(email);
    }

    return(
        <Router>
            <div className="App">
                <Routes>
                    <Route path="/" element={<HomePage />}/>
                    <Route path="/Login" element={<LoginForm onLoginSuccess={() => setIsLoggedIn(true)} />}/>
                    <Route path="/Booking" element={<Booking isLoggedIn={isLoggedIn} />}/>
                    <Route path="/admin" element={isLoggedIn && userEmail === "admin@example.com" ? <AdminPage />: <Navigate to="/Login"/>}/>
                    <Route path="/About" element={<About />}/>
                    <Route path="/contact" element={<ContactPage />}/>
                </Routes>
            </div>
        </Router>
    );
}

export default App;
