import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from "react-icons/fa";
import "./login.css";
import backgroundImage from "./assets/airplane.jpeg";

function LoginForm( {onLoginSuccess} ){
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const navigate = useNavigate();

    const handleInput = (event) => {
        const { name, value } = event.target;

        switch(name){
            case "email":
                setEmail(value);
                break;

            case "password":
                setPassword(value);
                break;

            default:
                break;
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!validateEmail(email)){
            setError("Invalid Email address");
            return;
        }

        if (password.length<8){
            setError("Password length must be 8 characters");
            return;
        }

        const hasAlphabet = /[a-zA-Z]/.test(password);
        const hasDigit = /\d/.test(password);
        const hasSpecialCharacter = /[!@#$%^&*()_+{}\[\]:;<>,.?]/g.test(password);

        if (!hasAlphabet || !hasDigit || !hasSpecialCharacter){
            setError("Invalid password");
            return;
        }

        try{
            const response = await fetch("http://localhost:3000/api/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok){
                throw new Error(data.message);
            }

            setSuccess(data.message);
            setError(null);
            onLoginSuccess();
            console.log("User logged in", data.user);
            navigate("/booking");

        }
        catch(err){
            setError(err.message);
            setSuccess(null);
        }
    };

    const validateEmail = (email) => {
        const valid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/; //Email validation regex
        return valid.test(email);
    };

    return (
        <div className="page-container" style={{ backgroundImage: `url(${backgroundImage})` }}>
            <nav className="top-nav">
                <div className="nav-logo">
                    <Link to="/">AirportManager</Link>
                </div>
                <div className="nav-links">
                    <Link to="/">Home</Link>
                    <Link to="/login">Login</Link>
                    <Link to="/booking">Booking</Link>
                    <Link to="/about">About</Link>
                    <Link to="/contact">Contact</Link>
                </div>
            </nav>

            <main className="main-content">
                <div className="login-container">
                    <h2>Login to AirportManager</h2>
                    {error && <div className="error-message">{error}</div>}
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="email">Email Address:</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={email}
                                onChange={handleInput}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="password">Password:</label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={password}
                                onChange={handleInput}
                                required
                            />
                        </div>
                        <button type="submit" className="login-button">Log in</button>
                    </form>
                </div>
            </main>

            <footer className="footer">
                <p>&copy; 2024 AirportManager. All rights reserved.</p>
                <div className="social-icons">
                    <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"><FaFacebook /></a>
                    <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"><FaTwitter /></a>
                    <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"><FaInstagram /></a>
                    <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer"><FaLinkedin /></a>
                </div>
            </footer>
        </div>
    );
}

export default LoginForm;
