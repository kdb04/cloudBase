import React, { useState } from 'react';
import { FaPlane, FaCalendarAlt, FaUser } from 'react-icons/fa';
import './booking.css';

const Booking = () => {
  const [bookingType, setBookingType] = useState('roundtrip');
  const [travelClass, setTravelClass] = useState('economy');

  return (
    <div className="booking-container">
      <div className="booking-content">
        <h2 className="booking-title">Book Your Flight</h2>

        <div className="booking-form">
          <div className="booking-options">
            <div className="booking-type">
              <button
                className={`option-button ${bookingType === 'roundtrip' ? 'active' : ''}`}
                onClick={() => setBookingType('roundtrip')}
              >
                Round Trip
              </button>
              <button
                className={`option-button ${bookingType === 'oneway' ? 'active' : ''}`}
                onClick={() => setBookingType('oneway')}
              >
                One Way
              </button>
            </div>
            <div className="travel-class">
              <button
                className={`option-button ${travelClass === 'economy' ? 'active' : ''}`}
                onClick={() => setTravelClass('economy')}
              >
                Economy
              </button>
              <button
                className={`option-button ${travelClass === 'business' ? 'active' : ''}`}
                onClick={() => setTravelClass('business')}
              >
                Business
              </button>
            </div>
          </div>

          <div className="form-grid">
            <div className="form-input">
              <FaPlane className="input-icon" />
              <input type="text" placeholder="From" />
            </div>
            <div className="form-input">
              <FaPlane className="input-icon rotated" />
              <input type="text" placeholder="To" />
            </div>
          </div>

          <div className="form-grid">
            <div className="form-input">
              <FaCalendarAlt className="input-icon" />
              <input type="date" />
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
            <input type="number" placeholder="Passengers" min="1" />
          </div>

          <div className="form-actions">
            <button className="action-button cancel">Cancel</button>
            <button className="action-button search">Search Flights</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Booking;
