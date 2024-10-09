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
                    <Link to="/flights">Flights</Link>
                    <Link to="/terminals">Terminals</Link>
                    <Link to="/services">Services</Link>
                    <Link to="/about">About</Link>
                    <Link to="/contact">Contact</Link>
                    <Link to="/login" className="login-btn">Login</Link>
                </div>
            </nav>

        <main className="main-content">
            <section className="hero">
                <h1>Welcome to AirportManager</h1>
                <p>Streamline your airport operations with our cutting-edge management system</p>
                <button className="cta-button">Get Started</button>
            </section>

            <section className="features">
                <h2>Our Features</h2>
                <div className="feature-grid">
                    <div className="feature-item">
                        <h3>Flight Tracking</h3>
                        <p>Real-time updates on all incoming and outgoing flights</p>
                    </div>
                     <div className="feature-item">
                        <h3>Terminal Management</h3>
                        <p>Efficiently manage gate assignments and passenger flow</p>
                    </div>
                    <div className="feature-item">
                        <h3>Resource Allocation</h3>
                        <p>Optimize staff and equipment distribution across the airport</p>
                    </div>
                    <div className="feature-item">
                        <h3>Passenger Services</h3>
                        <p>Enhance traveler experience with integrated service management</p>
                    </div>
                </div>
            </section>

            <section className="stats">
                <h2>AirportManager in Numbers</h2>
                <div className="stats-grid">
                    <div className="stat-item">
                        <span className="stat-number">500+</span>
                        <span className="stat-label">Airports Served</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-number">1M+</span>
                        <span className="stat-label">Flights Managed Daily</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-number">99.9%</span>
                        <span className="stat-label">Uptime</span>
                    </div>
                </div>
            </section>
        </main>

        <footer className="footer">
            <p>&copy; 2024 AirportManager. All rights reserved.</p>
        </footer>
    </div>
  );
};

export default HomePage;
