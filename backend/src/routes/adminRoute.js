const express = require("express");
const { adjustDynamicPricing , monitorFlightRoutes, editFlightSchedule } = require("../controllers/adminController");
const authAdmin = require("../authAdmin");
const router = express.Router();

router.post("/dynamic-pricing", authAdmin, adjustDynamicPricing);
router.get("/monitor-routes", authAdmin, monitorFlightRoutes);
router.put("/edit-schedule", authAdmin, editFlightSchedule);

module.exports = router;
