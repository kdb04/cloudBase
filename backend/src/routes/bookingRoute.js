const express = require("express");
const { 
    bookTicket, 
    cancelTicket, 
    getAvailableFlights, 
    getAlternateFlights, 
    getFlightStatus, 
    getTakenSeats, 
    getMyTickets, 
    getLocations, 
    joinWaitlist, 
    leaveWaitlist, 
    getMyWaitlist, 
    getLoyaltyStatus, 
    getMyProfile, 
    upsertMyProfile 
} = require("../controllers/bookingController");
const router = express.Router();
const db = require("../connection/db");
const authenticateToken = require("../middleware/authMiddleware");

//public routes
router.get("/locations", getLocations);
router.get("/available-flights", getAvailableFlights);
router.get("/flight-status/:flight_id", getFlightStatus);
router.post("/alternate-flights", getAlternateFlights);
router.get("/taken-seats/:flight_id", getTakenSeats);

//protected routes
router.get("/profile", authenticateToken, getMyProfile);
router.put("/profile", authenticateToken, upsertMyProfile);
router.get("/my-tickets", authenticateToken, getMyTickets);
router.get("/my-waitlist", authenticateToken, getMyWaitlist);
router.post("/waitlist", authenticateToken, joinWaitlist);
router.delete("/waitlist/:waitlist_id", authenticateToken, leaveWaitlist);
router.get("/loyalty", authenticateToken, getLoyaltyStatus);
router.post("/", authenticateToken, bookTicket);
router.delete("/:ticket_id", authenticateToken, cancelTicket);

module.exports = router;
