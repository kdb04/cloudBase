import React from "react";
import { Link } from "react-router-dom";
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from "react-icons/fa";
import "./contact.css";

const ContactPage = () => {
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

            <div className="contact-page">
                <div className="contact-card">
                    <h2>Contact Us</h2>
                    <div className="contact-info">
                        <div className="contact-item">
                            <FaPhone />
                            <span>+91 1234567890</span>
                        </div>
                        <div className="contact-item">
                            <FaEnvelope />
                            <span>info@AirportManager.com</span>
                        </div>
                        <div className="contact-item">
                            <FaMapMarkerAlt />
                            <span>123 Cross, MG Road, Bengaluru-560001</span>
                        </div>
                    </div>
                    <div className="social-icons">
                        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                            <FaFacebook />
                        </a>
                        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                            <FaTwitter />
                        </a>
                        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                            <FaInstagram />
                        </a>
                        <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="Linkedin">
                            <FaLinkedin />
                        </a>
                    </div>
                </div>
            </div>

            <footer className="footer">
                <p>&copy; 2024 AirportManager. All rights reserved.</p>
                <div className="social-icons">
                    <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                        <FaFacebook />
                    </a>
                    <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                        <FaTwitter />
                    </a>
                    <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                        <FaInstagram />
                    </a>
                    <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="Linkedin">
                        <FaLinkedin />
                    </a>
                </div>
            </footer>
        </div>
    );
};

export default ContactPage;
