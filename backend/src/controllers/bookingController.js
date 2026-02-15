const db = require("../connection/db.js");
const nodemailer = require("nodemailer");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

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

    // Check flight status before booking
    db.query("SELECT status FROM Flights WHERE flight_id = ?", [flight_id], (statusErr, statusResults) => {
        if (statusErr) {
            console.log(`[BOOKING] FAILED - Error checking flight status: ${statusErr.message}`);
            return res.status(500).json({ message: "Error checking flight status", error: statusErr });
        }
        if (statusResults.length === 0) {
            console.log(`[BOOKING] FAILED - Flight ${flight_id} not found`);
            return res.status(404).json({ message: "Flight not found" });
        }
        if (statusResults[0].status !== 'scheduled') {
            console.log(`[BOOKING] FAILED - Flight ${flight_id} is not available for booking (status: ${statusResults[0].status})`);
            return res.status(400).json({ message: `Flight is currently ${statusResults[0].status} and cannot be booked` });
        }

    const paymentStatus = transaction_id ? 'Paid' : 'Pending';
    const query = "INSERT INTO ticket (passenger_no, class, food_preference, source, destination, seat_no, flight_id, transaction_id, payment_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";

    db.query(query, [passenger_no, travelClass, food_preference, source, destination, seat_no, flight_id, transaction_id, paymentStatus], (err, results) => {
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
                payment_status: paymentStatus,
                transaction_id
            });
        });

        console.log(`[BOOKING] SUCCESS - Ticket ID: ${results.insertId} created for flight ${flight_id}`);
        return res.status(201).json({ message: "Flight booked successfully", ticket_id : results.insertId });
    });
    });
};

const sendCancellationEmail = (email, ticket, refundInfo) => {
    const refundStatusColor = refundInfo.status === 'succeeded' ? '#dcfce7' : '#fef3c7';
    const refundStatusTextColor = refundInfo.status === 'succeeded' ? '#166534' : '#92400e';
    const refundLabel = refundInfo.status === 'succeeded' ? 'Refund Processed'
        : refundInfo.status === 'pending' ? 'Refund Pending'
        : refundInfo.status === 'no_payment' ? 'No Payment to Refund'
        : 'Refund Failed';

    const mailOptions = {
        from: `"CloudBase" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: `Booking Cancelled - Ticket #${ticket.ticket_id}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background-color: #ef4444; color: white; padding: 24px; border-radius: 8px 8px 0 0; text-align: center;">
                    <h1 style="margin: 0;">Booking Cancelled</h1>
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
                            <td style="padding: 8px 0; color: #6b7280;">Class</td>
                            <td style="padding: 8px 0; font-weight: bold;">${ticket.class || 'N/A'}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; color: #6b7280;">Seat</td>
                            <td style="padding: 8px 0; font-weight: bold;">${ticket.seat_no || 'N/A'}</td>
                        </tr>
                    </table>

                    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 16px 0;" />

                    <h3 style="color: #374151;">Refund Details</h3>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 8px 0; color: #6b7280;">Status</td>
                            <td style="padding: 8px 0;">
                                <span style="background-color: ${refundStatusColor}; color: ${refundStatusTextColor}; padding: 4px 12px; border-radius: 12px; font-size: 13px; font-weight: bold;">
                                    ${refundLabel}
                                </span>
                            </td>
                        </tr>
                        ${refundInfo.amount ? `
                        <tr>
                            <td style="padding: 8px 0; color: #6b7280;">Refund Amount</td>
                            <td style="padding: 8px 0; font-weight: bold;">₹${(refundInfo.amount / 100).toFixed(2)}</td>
                        </tr>` : ''}
                        ${refundInfo.refund_id ? `
                        <tr>
                            <td style="padding: 8px 0; color: #6b7280;">Refund ID</td>
                            <td style="padding: 8px 0; font-size: 13px; font-family: monospace;">${refundInfo.refund_id}</td>
                        </tr>` : ''}
                    </table>

                    <p style="color: #6b7280; margin-top: 24px; font-size: 12px; text-align: center;">
                        If you have any questions, please contact our support team.
                    </p>
                </div>
            </div>
        `
    };

    transporter.sendMail(mailOptions)
        .then(() => console.log(`[CANCEL] Cancellation email sent to: ${email}`))
        .catch((err) => console.error(`[CANCEL] Failed to send cancellation email: ${err.message}`));
};

const cancelTicket = async (req, res) => {
    const { ticket_id } = req.params;
    const userEmail = req.user.email;
    console.log(`[CANCEL] Attempting to cancel ticket ID: ${ticket_id}`);

    // Fetch ticket details before deletion
    db.query(
        "SELECT ticket_id, flight_id, transaction_id, payment_status, source, destination, class, seat_no, food_preference FROM ticket WHERE ticket_id = ?",
        [ticket_id],
        async (err, ticketResults) => {
            if (err) {
                console.log(`[CANCEL] FAILED - Error fetching ticket ${ticket_id}: ${err.message}`);
                return res.status(500).json({ message: "Error cancelling flight", error: err });
            }
            if (ticketResults.length === 0) {
                console.log(`[CANCEL] NOT FOUND - Ticket ID: ${ticket_id}`);
                return res.status(404).json({ message: "Ticket not found" });
            }

            const ticket = ticketResults[0];
            let refundInfo = { status: 'no_payment', refund_id: null, amount: null };

            // Attempt Stripe refund if payment was made
            if (ticket.transaction_id && ticket.payment_status === 'Paid') {
                try {
                    const refund = await stripe.refunds.create({
                        payment_intent: ticket.transaction_id,
                    });
                    refundInfo = {
                        status: refund.status,
                        refund_id: refund.id,
                        amount: refund.amount,
                    };
                    console.log(`[CANCEL] Refund ${refund.status} - Refund ID: ${refund.id}, Amount: ${refund.amount}`);
                } catch (refundErr) {
                    console.error(`[CANCEL] Refund failed for ticket ${ticket_id}: ${refundErr.message}`);
                    refundInfo = { status: 'failed', refund_id: null, amount: null };
                }
            }

            // Delete the ticket
            db.query("DELETE FROM ticket WHERE ticket_id = ?", [ticket_id], (deleteErr) => {
                if (deleteErr) {
                    console.log(`[CANCEL] FAILED - Error deleting ticket ${ticket_id}: ${deleteErr.message}`);
                    return res.status(500).json({ message: "Error cancelling flight", error: deleteErr });
                }

                // Update dynamic pricing using flight_id fetched before deletion
                db.query("CALL dynamic_pricing(?)", [ticket.flight_id], (priceErr) => {
                    if (priceErr) console.error(`[CANCEL] Error updating dynamic pricing: ${priceErr.message}`);
                });

                // Send cancellation email
                sendCancellationEmail(userEmail, ticket, refundInfo);

                console.log(`[CANCEL] SUCCESS - Ticket ID: ${ticket_id} cancelled`);
                return res.status(200).json({
                    message: "Flight booking cancelled successfully",
                    refund_status: refundInfo.status,
                    refund_id: refundInfo.refund_id,
                });
            });
        }
    );
};

const getAvailableFlights = (req, res) => {
    const { source, destination, date, min_price, max_price } = req.query;
    console.log(`[READ] Searching flights: ${source} -> ${destination}${date ? ` on ${date}` : ''}`);

    let query = "SELECT flight_id, airline_id, source, destination, available_seats, price, arrival, departure, date, status FROM Flights WHERE source = ? AND destination = ? AND status != 'canceled'";
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

const getFlightStatus = (req, res) => {
    const { flight_id } = req.params;
    console.log(`[STATUS] Looking up flight status for flight: ${flight_id}`);

    const query = "SELECT f.*, a.airline_name FROM Flights f LEFT JOIN airlines a ON f.airline_id = a.airline_id WHERE f.flight_id = ?";

    db.query(query, [flight_id], (err, results) => {
        if (err) {
            console.log(`[STATUS] FAILED - Error fetching flight status: ${err.message}`);
            return res.status(500).json({ message: "Error fetching flight status", error: err });
        }
        if (results.length === 0) {
            console.log(`[STATUS] NOT FOUND - Flight ID: ${flight_id}`);
            return res.status(404).json({ message: "Flight not found" });
        }
        console.log(`[STATUS] Found flight ${flight_id} - Status: ${results[0].status}`);
        return res.status(200).json({ flight: results[0] });
    });
};

module.exports = { bookTicket, cancelTicket, getAvailableFlights, getAlternateFlights, getFlightStatus };
