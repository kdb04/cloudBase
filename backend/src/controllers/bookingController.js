const db = require("../connection/db.js");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendBookingConfirmation = (email, ticket) => {
    const mailOptions = {
        from: `"CloudBase" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: `Booking Confirmed - Ticket #${ticket.ticket_id}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background-color: #6366f1; color: white; padding: 24px; border-radius: 8px 8px 0 0; text-align: center;">
                    <h1 style="margin: 0;">Booking Confirmed!</h1>
                    <p style="margin: 8px 0 0;">Ticket #${ticket.ticket_id}</p>
                </div>

                <div style="border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; padding: 24px;">
                    <h3 style="color: #374151; margin-top: 0;">Flight Details</h3>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 8px 0; color: #6b7280;">Flight</td>
                            <td style="padding: 8px 0; font-weight: bold;">${ticket.flight_id}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; color: #6b7280;">Route</td>
                            <td style="padding: 8px 0; font-weight: bold;">${ticket.source} → ${ticket.destination}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; color: #6b7280;">Date</td>
                            <td style="padding: 8px 0; font-weight: bold;">${ticket.date || 'N/A'}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; color: #6b7280;">Departure</td>
                            <td style="padding: 8px 0; font-weight: bold;">${ticket.departure || 'N/A'}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; color: #6b7280;">Arrival</td>
                            <td style="padding: 8px 0; font-weight: bold;">${ticket.arrival || 'N/A'}</td>
                        </tr>
                    </table>

                    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 16px 0;" />

                    <h3 style="color: #374151;">Passenger Details</h3>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 8px 0; color: #6b7280;">Class</td>
                            <td style="padding: 8px 0; font-weight: bold;">${ticket.class}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; color: #6b7280;">Seat</td>
                            <td style="padding: 8px 0; font-weight: bold;">${ticket.seat_no}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; color: #6b7280;">Food Preference</td>
                            <td style="padding: 8px 0; font-weight: bold;">${ticket.food_preference || 'None'}</td>
                        </tr>
                    </table>

                    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 16px 0;" />

                    <h3 style="color: #374151;">Payment</h3>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 8px 0; color: #6b7280;">Status</td>
                            <td style="padding: 8px 0;">
                                <span style="background-color: ${ticket.payment_status === 'Paid' ? '#dcfce7' : '#fef3c7'}; color: ${ticket.payment_status === 'Paid' ? '#166534' : '#92400e'}; padding: 4px 12px; border-radius: 12px; font-size: 13px; font-weight: bold;">
                                    ${ticket.payment_status}
                                </span>
                            </td>
                        </tr>
                        ${ticket.transaction_id ? `
                        <tr>
                            <td style="padding: 8px 0; color: #6b7280;">Transaction ID</td>
                            <td style="padding: 8px 0; font-size: 13px; font-family: monospace;">${ticket.transaction_id}</td>
                        </tr>` : ''}
                    </table>

                    <p style="color: #6b7280; margin-top: 24px; font-size: 12px; text-align: center;">
                        Thank you for choosing CloudBase. Have a great flight!
                    </p>
                </div>
            </div>
        `
    };

    transporter.sendMail(mailOptions)
        .then(() => console.log(`[BOOKING] Confirmation email sent to: ${email}`))
        .catch((err) => console.error(`[BOOKING] Failed to send confirmation email: ${err.message}`));
};

const bookTicket = (req, res) => {
    const { passenger_no, class: travelClass, food_preference,  source, destination, seat_no, flight_id, transaction_id } = req.body;
    console.log(`[BOOKING] Creating ticket - Flight: ${flight_id}, Passenger: ${passenger_no}, Route: ${source} -> ${destination}`);
    const status = transaction_id ? 'Paid' : 'Pending';
    const query = "INSERT INTO ticket (passenger_no, class, food_preference, source, destination, seat_no, flight_id, transaction_id, payment_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";

    db.query(query, [passenger_no, travelClass, food_preference, source, destination, seat_no, flight_id, transaction_id, status], (err, results) => {
        if (err){
            console.log(`[BOOKING] FAILED - Error booking flight ${flight_id}: ${err.message}`);
            return res.status(500).json({ message: "Error booking flight", error: err});
        }

        db.query("CALL dynamic_pricing(?)", [flight_id], (priceErr) => {
            if(priceErr){
                console.error("Error updating the price:", priceErr);
            }
        });

        // Fetch flight details and send confirmation email
        const userEmail = req.user.email;
        db.query("SELECT departure, arrival, date FROM flights WHERE flight_id = ?", [flight_id], (flightErr, flightResults) => {
            const flight = flightResults && flightResults[0] ? flightResults[0] : {};
            sendBookingConfirmation(userEmail, {
                ticket_id: results.insertId,
                flight_id,
                source,
                destination,
                date: flight.date,
                departure: flight.departure,
                arrival: flight.arrival,
                class: travelClass,
                seat_no: seat_no,
                food_preference,
                payment_status: status,
                transaction_id
            });
        });

        console.log(`[BOOKING] SUCCESS - Ticket ID: ${results.insertId} created for flight ${flight_id}`);
        return res.status(201).json({ message: "Flight booked successfully", ticket_id : results.insertId });
    });
};

const cancelTicket = (req, res) => {
    const { ticket_id } = req.params;
    console.log(`[CANCEL] Attempting to cancel ticket ID: ${ticket_id}`);
    const deleteQuery = "DELETE FROM ticket WHERE ticket_id = ?";

    db.query(deleteQuery, [ticket_id], (err, results) => {
        if (err){
            console.log(`[CANCEL] FAILED - Error cancelling ticket ${ticket_id}: ${err.message}`);
            return res.status(500).json({ message: "Error cancelling flight", error: err});
        }
        if (results.affectedRows === 0){
            console.log(`[CANCEL] NOT FOUND - Ticket ID: ${ticket_id}`);
            return res.status(404).json({ message: "Ticket not found" });
        }

        const getFlightQuery = "SELECT flight_id FROM ticket WHERE ticket_id=?";
        db.query(getFlightQuery, [ticket_id], (flightErr, flightResult) => {
            if(!flightErr && flightResult.length>0) db.query("CALL dynamic_pricing(?)", [flightResult[0].flight_id]);
        });

        console.log(`[CANCEL] SUCCESS - Ticket ID: ${ticket_id} cancelled`);
        return res.status(200).json({ message: "Flight booking cancelled successfully"});
    });
};

const getAvailableFlights = (req, res) => {
    const { source, destination, date, min_price, max_price } = req.query;
    console.log(`[READ] Searching flights: ${source} -> ${destination}${date ? ` on ${date}` : ''}`);

    let query = "SELECT flight_id, airline_id, source, destination, available_seats, price, arrival, departure, date FROM Flights WHERE source = ? AND destination = ?";
    const params = [source, destination];

    if (date) {
        query += " AND date = ?";
        params.push(date);
    }

    if (min_price) {
        query += " AND price >= ?";
        params.push(Number(min_price));
    }

    if (max_price) {
        query += " AND price <= ?";
        params.push(Number(max_price));
    }

    db.query(query, params, (err, results) => {
        if (err){
            console.log(`[READ] FAILED - Error fetching flights: ${err.message}`);
            return res.status(500).json({ message: "Error fetching flight data", error: err });
        }
        console.log(`[READ] Found ${results.length} flights from ${source} to ${destination}`);
        return res.status(200).json({ Flights: results });
    })
}

const getAlternateFlights = (req, res) => {
    const { cancelled_flight_id } = req.body;
    console.log(`[READ] Searching alternate flights for cancelled flight: ${cancelled_flight_id}`);

    const query = "CALL alternative(?)";

    db.query(query, [cancelled_flight_id], (err, results) => {
        if (err){
            console.log(`[READ] FAILED - Error fetching alternate flights: ${err.message}`);
            return res.status(500).json({ error: "Error fetching alternate flights" });
        }

        const alternateFlights = results[0];
        console.log(`[READ] Found ${alternateFlights.length} alternate flights`);
        res.status(200).json({ alternateFlights });
    });
};

module.exports = { bookTicket, cancelTicket, getAvailableFlights, getAlternateFlights };
