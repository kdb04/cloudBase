const express = require("express");
const { userLogin, userSignup, userLogout } = require("../controllers/loginController");
const router = express.Router();

router.post("/", userLogin);
router.post("/signup", userSignup);
router.post("/logout", userLogout);

module.exports = router;
