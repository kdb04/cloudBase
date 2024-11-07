const db = require("../connection/db.js");

const bookTicket = (req, res) => {
    const { passenger_no, class: travelClass, food_preference,  source, destination, seat_no, flight_id } = req.body;
    //const query = `DESC Ticket`;
    const query = "INSERT INTO ticket (passenger_no, class, food_preference, source, destination, seat_no, flight_id) VALUES (?, ?, ?, ?, ?, ?, ?)";

    db.query(query, [passenger_no, travelClass, food_preference, source, destination, seat_no, flight_id], (err, results) => {
        if (err){
            console.error(err);
            return res.status(500).json({ message: "Error booking flight", error: err});
        }
        console.log(`Ticket booked for flight ${flight_id}`);
        return res.status(201).json({ message: "Flight booked successfully", ticket_id : results.insertId });
    });
};

const cancelTicket = (req, res) => {
    const { ticket_id } = req.params;
    const deleteQuery = "DELETE FROM ticket WHERE ticket_id = ?";

    db.query(deleteQuery, [ticket_id], (err, results) => {
        if (err){
            console.error(err);
            return res.status(500).json({ message: "Error cancelling flight", error: err});
        }
        if (results.affectedRows === 0){
            console.log(`Ticket with ID ${ticket_id} not found`);
            return res.status(404).json({ message: "Ticket not found" });
        }
        console.log(`Ticket with ID ${ticket_id} cancelled`);
        return res.status(200).json({ message: "Flight booking cancelled successfully"});
    });
};

const getAvailableFlights = (req, res) => {
    const { source, destination } = req.query;

    const query = "SELECT flight_id, source, destination, available_seats FROM Flights WHERE source = ? AND destination = ?";

    db.query(query, [source, destination], (err, results) => {
        if (err){
            console.error(err);
            return res.status(500).json({ message: "Error fetching flight data", error: err });
        }
        console.log(`Available flights from ${source} to ${destination} fetched`);
        return res.status(200).json({ Flights: results });
    })
}

module.exports = { bookTicket, cancelTicket, getAvailableFlights };
