import React from 'react';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';
import './about.css';

const About = () => {
  return (
    <div className="page-container">
      <nav className="top-nav">
        <div className="nav-logo">
          <a href="/">AirportManager</a>
        </div>
        <div className="nav-links">
          <a href="/">Home</a>
          <a href="/login">Login</a>
          <a href="/booking">Booking</a>
          <a href="/about">About</a>
          <a href="/contact">Contact</a>
        </div>
      </nav>

      <main className="main-content">
        <div className="hero">
          <h1>About AirportManager</h1>
          <p>Welcome to AirportManager, your premier getaway to the world!</p>
        </div>

        <div className="info-card about-card">
          <h2>Our Mission</h2>
          <p>
            We are dedicated to connecting people and places whilst, ensuring the highest standards of safety and satisfaction. Following are the core values we like to follow.
          </p>
          <div className="hover-content">
            <h3>Our Values</h3>
            <ul>
              <li>Innovation</li>
              <li>Efficiency</li>
              <li>Security</li>
              <li>Customer Satisfaction</li>
            </ul>
          </div>
        </div>

        <div className="info-card about-card">
          <h2>Our Vision</h2>
          <p>
            We envision a future where travel is accessible, seamless, and enjoyable for everyone. By leveraging advanced technologies and fostering a culture of excellence, we aim to create a world-class airport experience.
          </p>
          <div className="hover-content">
            <h3>Our Team</h3>
            <p>
              Led by industry veterans with over 50 years of combined experience in airport operations,
              software development, and aviation security.
            </p>
          </div>
        </div>

        <div className="info-card about-card">
          <h2>What We Offer</h2>
          <ul>
            <li>Real-time security monitoring and alerts</li>
            <li>Integrated weather update systems</li>
            <li>Comprehensive travel guideline management</li>
            <li>Health and safety protocol implementation</li>
          </ul>
          <div className="hover-content">
            <p>
              Our solutions are tailored to meet the unique needs of airports of all sizes,
              from regional hubs to international gateways.
            </p>
          </div>
        </div>
        
        <div className="info-card about-card">
            <h2>Feedback</h2>
            <p>Provide us with your valuable feedback, in order to enhance the experience for everyone.</p>
            <div className="hover-content">
                <p>Feel free to reach out to our customer-services team. Follow us on social media for the latest updates.</p>
            </div>
        </div>
      </main>

      <footer className="footer">
        <p>© 2024 AirportManager. All rights reserved.</p>
        <div className="social-icons">
          <a href="#"><FaFacebook /></a>
          <a href="#"><FaTwitter /></a>
          <a href="#"><FaInstagram /></a>
          <a href="#"><FaLinkedin /></a>
        </div>
      </footer>
    </div>
  );
};

export default About;
