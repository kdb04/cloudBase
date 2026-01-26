const express = require("express");
const router = express.Router();
const { handleEditSchedule } = require("../controllers/adminController");
const authenticateToken = require("../middleware/authMiddleware");

router.use(authenticateToken);

router.put("/edit-schedule", handleEditSchedule);

module.exports = router;
