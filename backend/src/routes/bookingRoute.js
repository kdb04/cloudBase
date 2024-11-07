const express = require("express");
const { bookTicket, cancelTicket, getAvailableFlights } = require("../controllers/bookingController");
const router = express.Router();

router.post("/", bookTicket);
router.delete("/:ticket_id", cancelTicket);
router.get("/available-flights", getAvailableFlights);

module.exports = router;
