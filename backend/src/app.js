const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const db = require("./connection/db.js");

dotenv.config({ path: path.join(__dirname, "../../.env") });

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

async function startServer(){
    try{
        await db.connect();
        console.log("Database connected successfully");

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        })
    }catch(error){
        console.error("Unable to connect", error);
    }
}

startServer();
