import React from "react";
import { Link } from "react-router-dom";
import "./homepage.css";

const HomePage = () => {
    return(
        <div className="page-container">
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
            <section className="hero">
                <h1>Welcome to AirportManager</h1>
                <p>Streamline your airport operations with our cutting-edge management system</p>
            </section>

           <div className="info-grid">
                <div className="info-card security-alerts">
                    <h2>Security Alerts:</h2>
                    <p>No current security alerts. Airport operating normally</p>
                </div>

                <div className="info-card weather-updates">
                    <h2>Weather Updates:</h2>
                    
                </div>

                <div className="info-card travel-guidelines">
                    <h2>Travel Guidelines:</h2>
                    <p>Essential information for a smooth journey</p>
                    <div className="hover-content">
                        <ul>
                            <li>Arrive 2 hours before domestic flights</li>
                            <li>Have ID and boarding pass ready</li>
                            <li>Follow provided guidelines for carry-on items</li>
                        </ul>
                    </div>
                </div>

                <div className="info-card health-guidelines">
                    <h2>Health Guidelines:</h2>
                    <p>Stay informed about health protocols</p>
                    <div className="hover-content">
                        <ul>
                            <li>Masks recommended for sick individuals</li>
                            <li>Maintain social distancing if required</li>
                            <li>Provide information incase of specific illness</li>
                        </ul>
                    </div>
                </div>
           </div>
        </main>        

        <footer className="footer">
            <p>&copy; 2024 AirportManager. All rights reserved.</p>
        </footer>
    </div>
  );
};

export default HomePage;
