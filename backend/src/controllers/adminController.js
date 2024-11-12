//const { Pool } = require("mysql2/typings/mysql/lib/Pool.js");
const db = require("../connection/db.js");

const adjustDynamicPricing = (req, res) => {
    const { flight_id } = req.body;
    const query = "CALL dynamic_pricing(?)";

    db.query(query, [flight_id], (err) => {
        if (err){
            console.error("Error adjusting price:", err);
            return res.status(500).json({ message: "Error adjusting pricing", error: err });
        }
        console.log(`Pricing adjusted for flight ${flight_id}`);
        return res.status(200).json({ message: "Dynamic pricing applied successfully "});
    });
};

const monitorFlightRoutes = (req, res) => {
    const query = "SELECT flight_id, source, destination, available_seats, price FROM Flights";

    db.query(query, (err, results) => {
        if (err){
            console.error("Error fetching flight routes:", err);
            return res.status(500).json({ message: "Error fetching flight routes", error: err });
        }
        console.log("Flight routes fetched successfully");
        return res.status(200).json({ flights: results });
    });
};

const editFlightSchedule = (req, res) => {
    const { flight_id, new_source, new_destination, time } = req.body;
    const query = "UPDATE Flights SET source = ?, destination = ?, time = ? WHERE flight_id = ?";

    db.query(query, [new_source, new_destination, new_time, flight_id], (err, results) => {
        if (err){
            console.error("Error updating flight schedule:", err);
            return res.status(500).json({ message: "Error updating flight schedule", error: err });
        }
        if (results.affectedRows === 0){
            console.log(`Flight with ID ${flight_id} not found`);
            return res.status(404).json({ message: "Flight not found" });
        }
        console.log(`Flight schedule for flight ID ${flight_id} updated successfully`);

        const alternateQuery = "CALL alternative(?, ?)";
        db.query(alternateQuery, [flight_id, departure_date], (altErr, altRes) => {
            if (altErr){
                console.error("Error fetching alternate flights:", altErr);
                return res.status(500).json({ message:"Error fetching alternate flights", error: altErr });
            }
            const alternatives = altRes[0];
            console.log("Alternate flights fetched successfully");
            return res.status(200).json({ message: "Flight schedules updated and alternative flights retrieved successfully", alternatives });
        });
    });
};

module.exports = { adjustDynamicPricing, monitorFlightRoutes, editFlightSchedule };
