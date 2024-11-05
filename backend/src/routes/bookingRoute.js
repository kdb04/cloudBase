const express = require("express");
const { bookTicket, cancelTicket } = require("../controllers/bookingController");
const router = express.Router();

router.post("/", bookTicket);
router.delete("/", cancelTicket);

module.exports = router;
