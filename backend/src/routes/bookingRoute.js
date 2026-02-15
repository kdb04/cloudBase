const express = require("express");
const { bookTicket, cancelTicket, getAvailableFlights, getAlternateFlights, getFlightStatus } = require("../controllers/bookingController");
const router = express.Router();
const db = require("../connection/db");
const authenticateToken = require("../middleware/authMiddleware");

//public routes
router.get("/available-flights", getAvailableFlights);
router.get("/flight-status/:flight_id", getFlightStatus);
router.post("/alternate-flights", getAlternateFlights);

//protected routes
router.post("/", authenticateToken, bookTicket);
router.delete("/:ticket_id", authenticateToken, cancelTicket);

module.exports = router;
