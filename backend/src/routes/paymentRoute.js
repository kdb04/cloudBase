const express = require("express");
const router = express.Router();
const { createPaymentIntent } = require("../controllers/paymentController");
const authenticateToken = require("../middleware/authMiddleware");

// protected route 
router.post("/create-intent", authenticateToken, createPaymentIntent);

module.exports = router;
