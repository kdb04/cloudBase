const db = require("../connection/db.js");

const bookTicket = (req, res) => {
    const { passenger_no, class: travelClass, food_preference,  source, destination, seat_no, flight_id } = req.body;
    //const query = `DESC Ticket`;
    const query = `INSERT INTO ticket (passenger_no, class, food_preference, source, destination, seat_no, flight_id) VALUES (?, ?, ?, ?, ?, ?, ?)`;

    db.query(query, [passenger_no, travelClass, food_preference, source, destination, seat_no, flight_id], (err, results) => {
        if (err){
            console.error(err);
            return res.status(500).json({ message: "Error booking flight", error: err});
        }
        return res.status(201).json({ message: "Flight booked successfully", ticket_id : results.insertId });
    });
};

const cancelTicket = (req, res) => {
    const { ticket_id } = req.body;
    const deleteQuery = `DELETE FROM ticket WHERE ticket_id = ?`;
    
    db.query(deleteQuery, [ticket_id], (err, results) => {
        if (err){
            console.error(err);
            return res.status(500).json({ message: "Error cancelling flight", error: err});
        }
        return res.status(200).json({ message: "Flight booking cancelled successfully"});
    });
};

module.exports = { bookTicket, cancelTicket };
