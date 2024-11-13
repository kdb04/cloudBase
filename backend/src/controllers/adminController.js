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
            return res.status(400).send({ message: 'Schedule conflict: Another flight is assigned to the same runway within 30 minutes.' });
        }

        const insertQuery = `INSERT INTO Flights (flight_id, airline_id, status, source, destination, arrival, departure, available_seats, price, date, runway_no) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        db.query(insertQuery, [newFlight.flight_id, newFlight.airline_id, newFlight.status, newFlight.source, newFlight.destination, newFlight.arrival, newFlight.departure, newFlight.available_seats, newFlight.price, newFlight.date, newFlight.runway_no], (err, results) => {
            if (err) {
                console.error('Error inserting flight:', err);
                return res.status(500).send({ message: 'Error inserting flight', error: err });
            }

            res.status(200).send({ message: 'Flight inserted successfully' });
        });

    } catch (error) {
        console.error('Error checking runway conflict:', error);
        res.status(500).send({ message: 'Error checking runway conflict', error });
    }
};

module.exports = { handleEditSchedule };
