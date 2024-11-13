const express = require("express");
const router = express.Router();
const { handleEditSchedule } = require("../controllers/adminController");

router.put("/edit-schedule", handleEditSchedule);

module.exports = router;
