//const { Pool } = require("mysql2/typings/mysql/lib/Pool.js");
const db = require("../connection/db.js");

const checkRunwayConflict = async (newFlight) => {
    const conflictQuery = `
        SELECT COUNT(*) AS conflict_count
        FROM Flights
        WHERE runway_no = ?
          AND date = ?
          AND flight_id <> ?
          AND ABS(TIMESTAMPDIFF(MINUTE, ?, departure)) < 30
    `;

    return new Promise((resolve, reject) => {
        db.query(conflictQuery, [newFlight.runway_no, newFlight.date, newFlight.flight_id, newFlight.departure], (err, results) => {
            if (err) {
                return reject(err);
            }
            resolve(results[0].conflict_count);
        });
    });
};

const handleEditSchedule = async (req, res) => {
    const newFlight = req.body;

    try {
        const conflictCount = await checkRunwayConflict(newFlight);

        if (conflictCount > 0) {
            console.log(`[ADMIN] CONFLICT - Runway ${newFlight.runway_no} has a scheduling conflict`);
            return res.status(400).send({ message: 'Schedule conflict: Another flight is assigned to the same runway within 30 minutes.' });
        }

        console.log(`[ADMIN] Creating flight: ${newFlight.flight_id}, Route: ${newFlight.source} -> ${newFlight.destination}`);
        const insertQuery = `INSERT INTO Flights (flight_id, airline_id, status, source, destination, arrival, departure, available_seats, price, date, runway_no) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        db.query(insertQuery, [newFlight.flight_id, newFlight.airline_id, newFlight.status, newFlight.source, newFlight.destination, newFlight.arrival, newFlight.departure, newFlight.available_seats, newFlight.price, newFlight.date, newFlight.runway_no], (err, results) => {
            if (err) {
                console.log(`[ADMIN] FAILED - Error inserting flight ${newFlight.flight_id}: ${err.message}`);
                return res.status(500).send({ message: 'Error inserting flight', error: err });
            }

            console.log(`[ADMIN] SUCCESS - Flight ${newFlight.flight_id} inserted`);
            res.status(200).send({ message: 'Flight inserted successfully' });
        });

    } catch (error) {
        //console.error('Error checking runway conflict:', error);
        res.status(500).send({ message: 'Error checking runway conflict', error });
    }
};

const getAllFlights = (req, res) => {
    console.log(`[ADMIN] Fetching all flights`);
    const query = "SELECT flight_id, airline_id, status, source, destination, arrival, departure, available_seats, price, date, runway_no FROM Flights ORDER BY date, departure";

    db.query(query, (err, results) => {
        if (err) {
            console.log(`[ADMIN] FAILED - Error fetching flights: ${err.message}`);
            return res.status(500).json({ message: "Error fetching flights", error: err });
        }
        console.log(`[ADMIN] Found ${results.length} flights`);
        return res.status(200).json({ flights: results });
    });
};

const updateFlight = async (req, res) => {
    const { flight_id } = req.params;
    const updates = req.body;
    console.log(`[ADMIN] Updating flight: ${flight_id}`);

    try {
        // If departure or runway changed, check for conflicts
        if (updates.departure || updates.runway_no || updates.date) {
            const current = await new Promise((resolve, reject) => {
                db.query("SELECT * FROM Flights WHERE flight_id = ?", [flight_id], (err, results) => {
                    if (err) return reject(err);
                    if (results.length === 0) return reject(new Error("Flight not found"));
                    resolve(results[0]);
                });
            });

            const conflictCount = await checkRunwayConflict({
                flight_id,
                runway_no: updates.runway_no || current.runway_no,
                date: updates.date || current.date,
                departure: updates.departure || current.departure
            });

            if (conflictCount > 0) {
                console.log(`[ADMIN] CONFLICT - Runway scheduling conflict for flight ${flight_id}`);
                return res.status(400).json({ message: "Schedule conflict: Another flight is assigned to the same runway within 30 minutes." });
            }
        }

        const allowedFields = ['airline_id', 'status', 'source', 'destination', 'arrival', 'departure', 'available_seats', 'price', 'date', 'runway_no'];
        const setClauses = [];
        const values = [];

        for (const field of allowedFields) {
            if (updates[field] !== undefined) {
                setClauses.push(`${field} = ?`);
                values.push(updates[field]);
            }
        }

        if (setClauses.length === 0) {
            return res.status(400).json({ message: "No valid fields to update" });
        }

        values.push(flight_id);
        const query = `UPDATE Flights SET ${setClauses.join(', ')} WHERE flight_id = ?`;

        db.query(query, values, (err, results) => {
            if (err) {
                console.log(`[ADMIN] FAILED - Error updating flight ${flight_id}: ${err.message}`);
                return res.status(500).json({ message: "Error updating flight", error: err });
            }
            if (results.affectedRows === 0) {
                return res.status(404).json({ message: "Flight not found" });
            }
            console.log(`[ADMIN] SUCCESS - Flight ${flight_id} updated`);
            return res.status(200).json({ message: "Flight updated successfully" });
        });
    } catch (error) {
        if (error.message === "Flight not found") {
            return res.status(404).json({ message: "Flight not found" });
        }
        console.log(`[ADMIN] FAILED - Error updating flight ${flight_id}: ${error.message}`);
        return res.status(500).json({ message: "Error updating flight", error });
    }
};

const deleteFlight = (req, res) => {
    const { flight_id } = req.params;
    console.log(`[ADMIN] Deleting flight: ${flight_id}`);

    db.query("DELETE FROM Flights WHERE flight_id = ?", [flight_id], (err, results) => {
        if (err) {
            console.log(`[ADMIN] FAILED - Error deleting flight ${flight_id}: ${err.message}`);
            return res.status(500).json({ message: "Error deleting flight", error: err });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ message: "Flight not found" });
        }
        console.log(`[ADMIN] SUCCESS - Flight ${flight_id} deleted`);
        return res.status(200).json({ message: "Flight deleted successfully" });
    });
};

module.exports = { handleEditSchedule, getAllFlights, updateFlight, deleteFlight };
