import React, { useState } from 'react';
import { FaPlane, FaCalendarAlt, FaUser, FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';
import './booking.css';

const Booking = () => {
    const [bookingType, setBookingType] = useState('roundtrip');
    const [travelClass, setTravelClass] = useState('economy');
    const [passengerNo, setPassengerNo] = useState(1);
    const [foodPreference, setFoodPreference] = useState('');
    const [date, setDate] = useState('');
    const [source, setSource] = useState('');
    const [destination, setDestination] = useState('');
    const [seatNo, setSeatNo] = useState('');
    //const [flightNo, setFlightNo] = useState('');
    const [ticketId, setTicketId] = useState(null);
    //const [testMsg, setTestMsg] = useState('');
    const [availableFlights, setAvailableFlights] = useState([]);
    const [selectedFlightId, setSelectedFlightId] = useState(null);

    const handleSearch = async () => {
        try{
            const response = await fetch (`http://localhost:3000/api/bookings/available-flights?source=${source}&destination=${destination}`);
            if (!response.ok){
                throw new Error("Failed to fetch flight data");
            }

            const result = await response.json();
            setAvailableFlights(result.Flights);
        }
        catch(err){
            console.error("Error fetching flights:", err);
        }
    }

    const handleBooking = async(e) => {
        e.preventDefault();
        if(!selectedFlightId){
            return alert("Please select a flight");
        }

        const bookingData = {
            passenger_no: passengerNo,
            class: travelClass,
            food_preference: foodPreference,
            date,
            source,
            destination,
            seat_no: seatNo,
            flight_id: selectedFlightId,
        };

        try {
            const response = await fetch(`http://localhost:3000/api/bookings`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(bookingData),
            });

            if (!response.ok) {
                throw new Error("Failed to book flight");
            }

            const result = await response.json();
            console.log('Booking successful:', result);

            setTicketId(result.ticket_id);
        } catch (error) {
            console.error("Error during booking:", error);
        }
    }

    const handleFlightSelection = (flightId) => {
        setSelectedFlightId(flightId);
    }

    const handleCancel = async () => {
        if (!ticketId) return; 

        try {
            const response = await fetch(`http://localhost:3000/api/bookings/${ticketId}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                throw new Error("Failed to cancel booking");
            }

            const result = await response.json();
            console.log("Booking canceled:", result);

            setSelectedFlightId(null);
            setTicketId(null);
            setAvailableFlights([]);
        } catch (error) {
            console.error("Error during cancellation:", error);
        }
    };

    /*const fetchTestMsg = async () => {
        try{
            const response = await fetch("http://localhost:3000/api/test");
            if (!response.ok){
                throw new Error("Failed to fetch test message");
            }
            const result =  await response.json();
            setTestMsg(result.message);
        }catch(error){
            console.error("Error:", error);
        }
    }*/

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
                <div className="booking-container">
                    <div className="booking-content">
                        <h2 className="booking-title">Book Your Flight</h2>
                        <form className="booking-form" onSubmit={ handleBooking }>
                            <div className="booking-options">
                                <div className="booking-type">
                                    <button className={`option-button ${bookingType === 'roundtrip' ? 'active' : ''}`} onClick={() => setBookingType('roundtrip')}>Round Trip</button>
                                    <button className={`option-button ${bookingType === 'oneway' ? 'active' : ''}`} onClick={() => setBookingType('oneway')}>One Way</button>
                                </div>
                                <div className="travel-class">
                                    <button className={`option-button ${travelClass === 'economy' ? 'active' : ''}`} onClick={() => setTravelClass('economy')}>Economy</button>
                                    <button className={`option-button ${travelClass === 'business' ? 'active' : ''}`} onClick={() => setTravelClass('business')}>Business</button>
                                </div>
                            </div>
                            <div className="form-grid">
                                <div className="form-input">
                                    <FaPlane className="input-icon" />
                                    <input type="text" placeholder="From" value={source} onChange={(e) => setSource(e.target.value)}/>
                                </div>
                                <div className="form-input">
                                    <FaPlane className="input-icon rotated" />
                                    <input type="text" placeholder="To" value={destination} onChange={(e) => setDestination(e.target.value)}/>
                                </div>
                            </div>
                            <div className="form-grid">
                                <div className="form-input">
                                    <FaCalendarAlt className="input-icon" />
                                    <input type="date" value={date} onChange={(e) => setDate(e.target.value)}/>
                                </div>
                                {bookingType === 'roundtrip' && (
                                <div className="form-input">
                                    <FaCalendarAlt className="input-icon" />
                                    <input type="date" />
                                </div>
                                )}
                            </div>
                            <div className="form-input">
                                <FaUser className="input-icon" />
                                <input type="number" placeholder="Passengers" min="1" value={passengerNo} onChange={(e) => setPassengerNo(e.target.value)}/>
                            </div>
                            <div className="form-input">
                                <input type="text" placeholder="Food Preferences" value={foodPreference} onChange={(e) => setFoodPreference(e.target.value)}/>
                            </div>
                            <div className="form-input">
                                <input type="text" placeholder="Seat Number" value={seatNo} onChange={(e) => setSeatNo(e.target.value)}/>
                            </div>
                            {/*<div className="form-input">
                                <input type="text" placeholder="Flight Number" value={flightNo} onChange={(e) => setFlightNo(e.target.value)}/>
                            </div>*/}
                            <div className="form-actions">
                                <button type="button" className="action-button search" onClick={handleSearch}>Search</button>
                            </div>
                        </form>
                        {/*<button onClick={fetchTestMsg}>Fetch</button>
                        {testMsg && <p>Test:{testMsg}</p>}*/}
                        {availableFlights.length > 0 && (
                            <div className="flights-list">
                                <h3>Available Flights</h3>
                                {availableFlights.map((flight) => (
                                    <div key={flight.flight_id} className={`flight-card ${selectedFlightId === flight.flight_id ? 'selected' : ''}`} onClick={() => handleFlightSelection(flight.flight_id)}>
                                        <p>Flight No: {flight.flight_id}</p>
                                        <p>Source: {flight.source}</p>
                                        <p>Destination: {flight.destination}</p>
                                        <p>Seats Available: {flight.available_seats}</p>
                                        <p>Price: {flight.price}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div className="form-actions">
                            <button type="button" className="action-button cancel" onClick={handleCancel}>Cancel</button>
                            <button type="submit" className="action-button submit" onClick={handleBooking}>Book Selected Flight</button>
                        </div>
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

export default Booking;
