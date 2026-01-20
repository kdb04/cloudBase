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

        db.query("CALL dynamic_pricing(?)", [flight_id], (priceErr) => {
            if(priceErr){
                console.error("Error updating the price:", priceErr);
            }
        });

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

        const getFlightQuery = "SELECT flight_id FROM ticket WHERE ticket_id=?";
        db.query(getFlightQuery, [ticket_id], (flightErr, flightResult) => {
            if(!flightErr && flightResult.length>0){
                db.query("CALL dynamic_pricing(?)", [flightResult[0].flight_id]);
            }
        });

        console.log(`Ticket with ID ${ticket_id} cancelled`);
        return res.status(200).json({ message: "Flight booking cancelled successfully"});
    });
};

const getAvailableFlights = (req, res) => {
    const { source, destination } = req.query;

    const query = "SELECT flight_id, airline_id, source, destination, available_seats, price, arrival, departure, date FROM Flights WHERE source = ? AND destination = ?";

    db.query(query, [source, destination], (err, results) => {
        if (err){
            console.error(err);
            return res.status(500).json({ message: "Error fetching flight data", error: err });
        }
        console.log(`Available flights from ${source} to ${destination} fetched`);
        return res.status(200).json({ Flights: results });
    })
}

const getAlternateFlights = (req, res) => {
    const { cancelled_flight_id } = req.body;

    const query = "CALL alternative(?)";

    db.query(query, [cancelled_flight_id], (err, results) => {
        if (err){
            console.error("Error fetching alternate flights:", err);
            return res.status(500).json({ error: "Error fetching alternate flights" });
        }

        const alternateFlights = results[0];

        res.status(200).json({ alternateFlights });
    });
};

module.exports = { bookTicket, cancelTicket, getAvailableFlights, getAlternateFlights };
