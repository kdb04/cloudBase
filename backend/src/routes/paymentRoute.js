const express = require("express");
const router = express.Router();
const { createPaymentIntent, createRoundTripPaymentIntent } = require("../controllers/paymentController");
const authenticateToken = require("../middleware/authMiddleware");

// protected route
router.post("/create-intent", authenticateToken, createPaymentIntent);
router.post("/create-round-trip-intent", authenticateToken, createRoundTripPaymentIntent);

module.exports = router;
