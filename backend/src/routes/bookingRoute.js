const express = require("express");
const { bookTicket, cancelTicket, getAvailableFlights, getAlternateFlights } = require("../controllers/bookingController");
const router = express.Router();
const db = require("../connection/db");

router.post("/", bookTicket);
router.delete("/:ticket_id", cancelTicket);
router.get("/available-flights", getAvailableFlights);
router.post("/alternate-flights", getAlternateFlights);

module.exports = router;
