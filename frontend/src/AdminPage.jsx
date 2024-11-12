import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from "react-icons/fa";
import styles from "./AdminPage.module.css";
import backgroundImage from "./assets/airplane.jpeg";
import axios from "axios";

function AdminPage(){
    const navigate = useNavigate();
    const [flightId, setFlightId] = useState("");
    const [newSource, setNewSource] = useState("");
    const [newDestination, setNewDestination] = useState("");
    const [newTime, setNewTime] = useState("");
    const [departureDate, setDepartureDate] = useState("");
    const [responseMessage, setResponseMessage] = useState("");
    const [alternativeFlights, setAlternativeFlights] = useState([]);

    const handleDynamicPricing = async () => {
        //console.log("Dynamic Pricing button clicked");
        try{
            const response = await axios.post("/api/admin/dynamic-pricing");
            setResponseMessage(response.data.message || "Dynamic price updated");
        }
        catch(err){
            setResponseMessage("Error updating dynamic pricing");
            console.error("Dynamic pricing error:", err);
        }
    };

    const handleMonitorRoutes = async () => {
        //console.log("Monitor Routing button clicked");
        try{
            const response = await axios.get("/api/admin/monitor-routes");
            setResponseMessage(response.data.message || "Routes monitored successfully");
        }
        catch(err){
            setResponseMessage("Error monitoring routes");
            console.error("Monitor routes error:", err);
        }
    };

    const handleEditSchedule = async () => {
        //console.log("Editing Scheduling button clicked");
        try{
            const response = await axios.post("/api/admin/edit-schedule", {
                flight_id: flightId,
                new_source: newSource,
                new_destination: newDestination,
                new_time: newTime,
                departure_time: departureDate
            });
            setResponseMessage(response.data.message || "Schedule updated successfully");
            setAlternativeFlights(response.data.alternatives || []);
        }
        catch(err){
            setResponseMessage("Error updating flight schedule");
            console.error("Edit schedule error");
        }
    };

    return(
        <div className={styles["admin-page"]}>
            <div className="page-container" style={{ backgroundImage: `url(${backgroundImage})`}}>
                <nav className={styles["top-nav"]}>
                    <div className={styles["nav-logo"]}>
                        <Link to="/">Airport Manager</Link>
                    </div>
                    <div className={styles["nav-links"]}>
                        <Link to="/">Home</Link>
                        <Link to="/login">Login</Link>
                        <Link to="/booking">Booking</Link>
                        <Link to="/about">About</Link>
                        <Link to="/contact">Contact</Link>
                    </div>
                </nav>

                <main className={styles["main-content"]}>
                    <div className={styles["admin-container"]}>
                        <h2>Welcome Admin</h2>
                        <div className={styles["admin-buttons"]}>
                            <button className={styles["admin-button"]} onClick={handleDynamicPricing}>Dynamic Pricing</button>
                            <button className={styles["admin-button"]} onClick={handleMonitorRoutes}>Monitor Routes</button>
                            {/*<button className="admin-button" onClick={handleEditSchedule}>Editing Schedule</button>*/}
                        </div>
                        <div className={styles["schedule-form"]}>
                            <h3>Edit Flight Schedule</h3>
                            <input type="text" placeholder="Flight ID" value={flightId} onChange={(e) => setFlightId(e.target.value)} />
                            <input type="text" placeholder="New Source" value={newSource} onChange={(e) => setNewSource(e.target.value)} />
                            <input type="text" placeholder="New Destination" value={newDestination} onChange={(e) => setNewDestination(e.target.value)} />
                            <input type="text" placeholder="New Time" value={newTime} onChange={(e) => setNewTime(e.target.value)} />
                            <input type="text" placeholder="Departure Date" value={departureDate} onChange={(e) => setDepartureDate(e.target.value)} />
                            <button className={styles["admin-button"]} onClick={handleEditSchedule}>Edit Schedule</button>
                        </div>

                        {responseMessage && <p className={styles["response-message"]}>{responseMessage}</p>}
                        {alternativeFlights.length>0 && (
                            <div className={styles["alternative-flights"]}>
                                <h3>Alternative Flights</h3>
                                <ul>
                                    {alternativeFlights.map((Flights, index) => (
                                        <li key={index}>
                                            Flight ID: {Flights.flight_id}, Airline: {Flights.airline_id}, Departure: {Flights.departure},
                                            Arrival: {Flights.arrival}, Seats: {Flights.available_seats}, Price: {Flights.price}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </main>

                <footer className={styles["footer"]}>
                    <p>&copy; 2024 Airport Manager. All rights reserved.</p>
                    <div className={styles["social-icons"]}>
                        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"><FaFacebook /></a>
                        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"><FaTwitter /></a>
                        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"><FaInstagram /></a>
                        <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer"><FaLinkedin /></a>
                    </div>
                </footer>
            </div>
        </div>
    );
}

export default AdminPage;
