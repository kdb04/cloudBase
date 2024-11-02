const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
const db = require("./connection/db.js");

dotenv.config({ path: path.join(__dirname, "..", "..", ".env") });

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
