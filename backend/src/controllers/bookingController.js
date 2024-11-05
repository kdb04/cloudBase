const db = require("../connection/db.js");

const bookTicket = (req, res) => {
    const { passenger_no, class: travelClass, food_preference, date, source, destination, seat_no, flight_id } = req.body;
    //const query = `DESC Ticket`;
    const query = `INSERT INTO Ticket (passenger_no, class, food_preference, date, source, destination, seat_no, flight_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

    db.query(query, [passenger_no, travelClass, food_preference, date, source, destination, seat_no, flight_id], (err, results) => {
        if (err){
            console.error(err);
            return res.status(500).json({ message: "Error booking flight", error: err});
        }
        return res.status(201).json({ message: "Flight booked successfully", ticket_id : results.insertId });
    });
};

module.exports = { bookTicket };
