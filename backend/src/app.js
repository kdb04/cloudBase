const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const db = require("./connection/db.js");
const bookingRoute = require("./routes/bookingRoute");
const loginRoute = require("./routes/loginRoute");
const adminRoute = require("./routes/adminRoute");

dotenv.config({ path: path.join(__dirname, "../../.env") });

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/bookings", bookingRoute);
app.use("/api/login", loginRoute);
app.use("/api/admin", adminRoute);

/*app.get("/api/test", (req, res) => {
    res.json({ message: "Backend-Frontend connected successfully"});
})*/

const PORT = process.env.PORT || 3000;

async function startServer(){
    try{
        await db.connect();

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        })
    }catch(error){
        console.error("Unable to connect", error);
    }
}

startServer();
