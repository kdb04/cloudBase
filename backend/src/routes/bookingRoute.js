const express = require("express");
const { bookTicket, cancelTicket, getAvailableFlights } = require("../controllers/bookingController");
const router = express.Router();
const db = require("../connection/db");

router.post("/", bookTicket);
router.delete("/:ticket_id", cancelTicket);
router.get("/available-flights", getAvailableFlights);


router.post("/alternate-flights", async (req, res) => {
    const { cancelled_flight_id, departure_date } = req.body;

    if (!cancelled_flight_id || !departure_date) {
        return res.status(400).json({ error: "Both cancelled_flight_id and departure_date are required." });
    }

    try {
        const cancelledFlightId = parseInt(cancelled_flight_id, 10);
        if (isNaN(cancelledFlightId)) {
            return res.status(400).json({ error: "Invalid cancelled_flight_id." });
        }

        const [results] = await db.promise().query(`CALL alternative(?, ?)`, [cancelledFlightId, departure_date]);
        res.json({ alternativeFlights: results[0] });
    } catch (err) {
        console.error("Error fetching alternate flights", err);
        res.status(500).json({ error: "Failed to fetch alternative flights" });
    }
});

module.exports = router;
