const express = require("express");
const router = express.Router();
const { handleEditSchedule, getAllFlights, updateFlight, deleteFlight } = require("../controllers/adminController");
const authenticateToken = require("../middleware/authMiddleware");

router.use(authenticateToken);

router.get("/flights", getAllFlights);
router.put("/edit-schedule", handleEditSchedule);
router.patch("/flights/:flight_id", updateFlight);
router.delete("/flights/:flight_id", deleteFlight);

module.exports = router;
