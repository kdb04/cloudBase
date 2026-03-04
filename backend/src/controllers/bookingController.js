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

const awardLoyaltyPoints = (userId, ticketId, pointsEarned) => {
    db.beginTransaction((txErr) => {
        if (txErr) { console.error('[LOYALTY] Transaction start error:', txErr.message); return; }
        db.query(
            `INSERT INTO loyalty_points (user_id, points, tier)
             VALUES (?, ?, 'Bronze')
             ON DUPLICATE KEY UPDATE
               points = points + ?,
               tier = CASE
                 WHEN points + ? >= 10000 THEN 'Platinum'
                 WHEN points + ? >= 5000  THEN 'Gold'
                 WHEN points + ? >= 1000  THEN 'Silver'
                 ELSE 'Bronze'
               END`,
            [userId, pointsEarned, pointsEarned, pointsEarned, pointsEarned, pointsEarned],
            (lpErr) => {
                if (lpErr) {
                    console.error('[LOYALTY] Error upserting loyalty_points:', lpErr.message);
                    return db.rollback(() => {});
                }
                db.query(
                    `INSERT INTO point_transactions (user_id, ticket_id, points_earned, points_redeemed)
                     VALUES (?, ?, ?, 0)`,
                    [userId, ticketId, pointsEarned],
                    (ptErr) => {
                        if (ptErr) {
                            console.error('[LOYALTY] Error inserting point_transaction:', ptErr.message);
                            return db.rollback(() => {});
                        }
                        db.commit((commitErr) => {
                            if (commitErr) {
                                console.error('[LOYALTY] Commit error:', commitErr.message);
                                db.rollback(() => {});
                            }
                        });
                    }
                );
            }
        );
    });
};

const reverseLoyaltyPoints = (userId, earned, onComplete) => {
    db.beginTransaction((txErr) => {
        if (txErr) {
            console.error('[LOYALTY] Transaction start error:', txErr.message);
            return onComplete(txErr);
        }
        db.query(
            `UPDATE loyalty_points
             SET points = GREATEST(0, points - ?),
                 tier = CASE
                   WHEN GREATEST(0, points - ?) >= 10000 THEN 'Platinum'
                   WHEN GREATEST(0, points - ?) >= 5000  THEN 'Gold'
                   WHEN GREATEST(0, points - ?) >= 1000  THEN 'Silver'
                   ELSE 'Bronze'
                 END
             WHERE user_id = ?`,
            [earned, earned, earned, earned, userId],
            (lpErr) => {
                if (lpErr) {
                    console.error('[LOYALTY] Error reversing loyalty_points:', lpErr.message);
                    return db.rollback(() => onComplete(lpErr));
                }
                db.query(
                    `INSERT INTO point_transactions (user_id, ticket_id, points_earned, points_redeemed)
                     VALUES (?, NULL, 0, ?)`,
                    [userId, earned],
                    (rptErr) => {
                        if (rptErr) {
                            console.error('[LOYALTY] Error inserting reversal transaction:', rptErr.message);
                            return db.rollback(() => onComplete(rptErr));
                        }
                        db.commit((commitErr) => {
                            if (commitErr) {
                                console.error('[LOYALTY] Commit error:', commitErr.message);
                                return db.rollback(() => onComplete(commitErr));
                            }
                            onComplete(null);
                        });
                    }
                );
            }
        );
    });
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
    const userId = req.user?.id;
    if (!userId) {
        console.log(`[BOOKING] FAILED - User not authenticated`);
        return res.status(401).json({ message: "User authentication required" });
    }
    const query = "INSERT INTO ticket (passenger_no, class, food_preference, source, destination, seat_no, flight_id, transaction_id, payment_status, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

    db.query(query, [passenger_no, travelClass, food_preference, source, destination, seat_no, flight_id, transaction_id, paymentStatus, userId], (err, results) => {
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
        db.query("SELECT departure, arrival, date, price FROM flights WHERE flight_id = ?", [flight_id], (flightErr, flightResults) => {
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

            // Award loyalty points based on flight price
            const pointsEarned = Math.floor(flight.price || 0);
            if (pointsEarned > 0) {
                awardLoyaltyPoints(userId, results.insertId, pointsEarned);
            }
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

    // Fetch ticket details before deletion (ownership check via user_id)
    db.query(
        "SELECT ticket_id, flight_id, transaction_id, payment_status, source, destination, class, seat_no, food_preference FROM ticket WHERE ticket_id = ? AND user_id = ?",
        [ticket_id, req.user.id],
        async (err, ticketResults) => {
            if (err) {
                console.log(`[CANCEL] FAILED - Error fetching ticket ${ticket_id}: ${err.message}`);
                return res.status(500).json({ message: "Error cancelling flight", error: err });
            }
            if (ticketResults.length === 0) {
                console.log(`[CANCEL] NOT FOUND or UNAUTHORIZED - Ticket ID: ${ticket_id}`);
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

            // Look up earned points, reverse them, then delete the ticket — all sequentially
            db.query(
                `SELECT points_earned FROM point_transactions WHERE ticket_id = ? AND user_id = ?`,
                [ticket_id, req.user.id],
                (_ptErr, ptRows) => {
                    const earned = ptRows?.[0]?.points_earned || 0;

                    const deleteTicket = () => {
                        db.query("DELETE FROM ticket WHERE ticket_id = ?", [ticket_id], (deleteErr) => {
                            if (deleteErr) {
                                console.log(`[CANCEL] FAILED - Error deleting ticket ${ticket_id}: ${deleteErr.message}`);
                                return res.status(500).json({ message: "Error cancelling flight", error: deleteErr });
                            }

                            // Update dynamic pricing using flight_id fetched before deletion
                            db.query("CALL dynamic_pricing(?)", [ticket.flight_id], (priceErr) => {
                                if (priceErr) console.error(`[CANCEL] Error updating dynamic pricing: ${priceErr.message}`);
                            });

                            // Notify first confirmed waitlist entry (set by trigger)
                            db.query(
                                `SELECT w.waitlist_id, w.flight_id, u.email, f.source, f.destination, f.date
                                 FROM waitlist w
                                 JOIN users u ON w.user_id = u.user_id
                                 JOIN flights f ON w.flight_id = f.flight_id
                                 WHERE w.flight_id = ? AND w.status = 'confirmed'
                                 ORDER BY w.requested_at ASC LIMIT 1`,
                                [ticket.flight_id],
                                (wErr, wResults) => {
                                    if (!wErr && wResults.length > 0) {
                                        sendWaitlistConfirmationEmail(wResults[0].email, wResults[0]);
                                    }
                                }
                            );

                            // Send cancellation email
                            sendCancellationEmail(userEmail, ticket, refundInfo);

                            console.log(`[CANCEL] SUCCESS - Ticket ID: ${ticket_id} cancelled`);
                            return res.status(200).json({
                                message: "Flight booking cancelled successfully",
                                refund_status: refundInfo.status,
                                refund_id: refundInfo.refund_id,
                            });
                        });
                    };

                    if (earned > 0) {
                        reverseLoyaltyPoints(req.user.id, earned, (_loyaltyErr) => deleteTicket());
                    } else {
                        deleteTicket();
                    }
                }
            );
        }
    );
};

const getAvailableFlights = (req, res) => {
    const { source, destination, date, min_price, max_price, stops } = req.query;
    console.log(`[READ] Searching flights: ${source} -> ${destination}${date ? ` on ${date}` : ''}`);

    let query = "SELECT flight_id, airline_id, source, destination, available_seats, price, arrival, departure, date, status, stops FROM Flights WHERE source = ? AND destination = ? AND status = 'scheduled'";
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

    if (stops !== undefined && stops !== '') {
        const stopsNum = Number(stops);
        if (isNaN(stopsNum)) return res.status(400).json({ message: "Invalid stops value" });
        if (stopsNum >= 2) query += " AND stops >= ?";
        else query += " AND stops = ?";
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

const getTakenSeats = (req, res) => {
    const { flight_id } = req.params;
    console.log(`[READ] Fetching taken seats for flight: ${flight_id}`);
    db.query("SELECT seat_no FROM ticket WHERE flight_id = ?", [flight_id], (err, results) => {
        if (err){
            console.log(`[READ] FAILED - Error fetching taken seats for flight ${flight_id}: ${err.message}`);
            return res.status(500).json({ message: "Error fetching taken seats", error: err.message });
        }
        const takenSeats = results.map(row => Number(row.seat_no));
        console.log(`[READ] Found ${takenSeats.length} taken seats for flight ${flight_id}`);
        return res.status(200).json({ takenSeats });
    });
};

const getMyTickets = (req, res) => {
    const userId = req.user.id;
    console.log(`[READ] Fetching tickets for user: ${userId}`);
    const query = `
        SELECT t.ticket_id, t.flight_id, t.source, t.destination,
               t.class, t.seat_no, t.food_preference,
               t.transaction_id, t.payment_status, t.amount_paid,
               f.departure, f.arrival, f.date, f.status AS flight_status,
               a.airline_name
        FROM ticket t
        JOIN flights f ON t.flight_id = f.flight_id
        LEFT JOIN airlines a ON f.airline_id = a.airline_id
        WHERE t.user_id = ?
        ORDER BY f.date DESC, f.departure DESC
    `;
    db.query(query, [userId], (err, results) => {
        if (err) {
            console.log(`[READ] FAILED - Error fetching tickets for user ${userId}: ${err.message}`);
            return res.status(500).json({ message: "Error fetching bookings", error: err });
        }
        console.log(`[READ] Found ${results.length} tickets for user ${userId}`);
        return res.status(200).json({ tickets: results });
    });
};

const sendWaitlistConfirmationEmail = (email, entry) => {
    const mailOptions = {
        from: `"CloudBase" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: `Seat Available – Action Required for Flight #${entry.flight_id}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background-color: #22c55e; color: white; padding: 24px; border-radius: 8px 8px 0 0; text-align: center;">
                    <h1 style="margin: 0;">A Seat Is Available!</h1>
                    <p style="margin: 8px 0 0;">Flight #${entry.flight_id}</p>
                </div>
                <div style="border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; padding: 24px;">
                    <p style="color: #374151;">Good news! Your waitlist spot for the following flight has been confirmed:</p>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 8px 0; color: #6b7280;">Route</td>
                            <td style="padding: 8px 0; font-weight: bold;">${entry.source} → ${entry.destination}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; color: #6b7280;">Date</td>
                            <td style="padding: 8px 0; font-weight: bold;">${entry.date}</td>
                        </tr>
                    </table>
                    <p style="color: #374151; margin-top: 16px;">
                        Please log in to CloudBase and book your seat as soon as possible before the spot expires.
                    </p>
                    <p style="color: #6b7280; margin-top: 24px; font-size: 12px; text-align: center;">
                        If you no longer need this seat, you can leave the waitlist from your bookings page.
                    </p>
                </div>
            </div>
        `
    };

    transporter.sendMail(mailOptions)
        .then(() => console.log(`[WAITLIST] Confirmation email sent to: ${email}`))
        .catch((err) => console.error(`[WAITLIST] Failed to send confirmation email: ${err.message}`));
};

const joinWaitlist = (req, res) => {
    const { flight_id, class: travelClass } = req.body;
    const user_id = req.user.id;
    console.log(`[WAITLIST] User ${user_id} joining waitlist for flight ${flight_id}`);

    db.query("SELECT available_seats FROM flights WHERE flight_id = ?", [flight_id], (err, flightResults) => {
        if (err) return res.status(500).json({ message: "Error checking flight", error: err });
        if (flightResults.length === 0) return res.status(404).json({ message: "Flight not found" });
        if (flightResults[0].available_seats > 0) {
            return res.status(400).json({ message: "Flight still has available seats" });
        }

        db.query(
            "SELECT waitlist_id FROM waitlist WHERE user_id = ? AND flight_id = ? AND status IN ('waiting','confirmed')",
            [user_id, flight_id],
            (dupErr, dupResults) => {
                if (dupErr) return res.status(500).json({ message: "Error checking waitlist", error: dupErr });
                if (dupResults.length > 0) return res.status(409).json({ message: "Already on waitlist for this flight" });

                db.query(
                    "INSERT INTO waitlist (user_id, flight_id, class) VALUES (?, ?, ?)",
                    [user_id, flight_id, travelClass || null],
                    (insertErr, insertResults) => {
                        if (insertErr) return res.status(500).json({ message: "Error joining waitlist", error: insertErr });
                        console.log(`[WAITLIST] User ${user_id} joined waitlist ${insertResults.insertId} for flight ${flight_id}`);
                        return res.status(201).json({ waitlist_id: insertResults.insertId });
                    }
                );
            }
        );
    });
};

const leaveWaitlist = (req, res) => {
    const { waitlist_id } = req.params;
    const user_id = req.user.id;
    console.log(`[WAITLIST] User ${user_id} leaving waitlist ${waitlist_id}`);

    db.query(
        "SELECT waitlist_id FROM waitlist WHERE waitlist_id = ? AND user_id = ?",
        [waitlist_id, user_id],
        (err, results) => {
            if (err) return res.status(500).json({ message: "Error finding waitlist entry", error: err });
            if (results.length === 0) return res.status(404).json({ message: "Waitlist entry not found" });

            db.query(
                "UPDATE waitlist SET status = 'cancelled' WHERE waitlist_id = ?",
                [waitlist_id],
                (updateErr) => {
                    if (updateErr) return res.status(500).json({ message: "Error leaving waitlist", error: updateErr });
                    console.log(`[WAITLIST] Waitlist entry ${waitlist_id} cancelled`);
                    return res.status(200).json({ message: "Removed from waitlist" });
                }
            );
        }
    );
};

const getMyWaitlist = (req, res) => {
    const user_id = req.user.id;
    console.log(`[WAITLIST] Fetching waitlist for user ${user_id}`);

    const query = `
        SELECT w.waitlist_id, w.flight_id, w.class, w.requested_at, w.status,
               f.source, f.destination, f.departure, f.arrival, f.date, f.price,
               a.airline_name
        FROM waitlist w
        JOIN flights f ON w.flight_id = f.flight_id
        LEFT JOIN airlines a ON f.airline_id = a.airline_id
        WHERE w.user_id = ?
        ORDER BY w.requested_at DESC
    `;

    db.query(query, [user_id], (err, results) => {
        if (err) {
            console.log(`[WAITLIST] FAILED - Error fetching waitlist for user ${user_id}: ${err.message}`);
            return res.status(500).json({ message: "Error fetching waitlist", error: err });
        }
        console.log(`[WAITLIST] Found ${results.length} waitlist entries for user ${user_id}`);
        return res.status(200).json({ waitlist: results });
    });
};

const getLocations = (req, res) => {
    const { q } = req.query;
    const searchTerm = `${q || ''}%`;
    const query = `
        SELECT DISTINCT city FROM (
            SELECT source AS city FROM flights
            UNION
            SELECT destination AS city FROM flights
        ) AS cities
        WHERE city LIKE ?
        ORDER BY city ASC
        LIMIT 10
    `;
    db.query(query, [searchTerm], (err, results) => {
        if (err) return res.status(500).json({ error: 'Error fetching locations' });
        return res.status(200).json({ locations: results.map(r => r.city) });
    });
};

const getLoyaltyStatus = (req, res) => {
    const userId = req.user.id;
    db.query(
        `SELECT lp.points, lp.tier, lp.updated_at,
                pt.pt_id, pt.ticket_id, pt.points_earned, pt.points_redeemed, pt.created_at AS tx_date
         FROM loyalty_points lp
         LEFT JOIN point_transactions pt ON pt.user_id = lp.user_id
         WHERE lp.user_id = ?
         ORDER BY pt.created_at DESC
         LIMIT 20`,
        [userId],
        (err, rows) => {
            if (err) return res.status(500).json({ error: 'DB error' });
            if (!rows.length) return res.json({ points: 0, tier: 'Bronze', transactions: [] });
            const { points, tier, updated_at } = rows[0];
            const transactions = rows
                .filter(r => r.pt_id)
                .map(r => ({
                    id: r.pt_id,
                    ticket_id: r.ticket_id,
                    points_earned: r.points_earned,
                    points_redeemed: r.points_redeemed,
                    date: r.tx_date,
                }));
            res.json({ points, tier, updated_at, transactions });
        }
    );
};

module.exports = { bookTicket, cancelTicket, getAvailableFlights, getAlternateFlights, getFlightStatus, getTakenSeats, getMyTickets, getLocations, joinWaitlist, leaveWaitlist, getMyWaitlist, getLoyaltyStatus };
