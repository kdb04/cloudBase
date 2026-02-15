const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const rateLimit = require("express-rate-limit");
const db = require("./connection/db.js");
const bookingRoute = require("./routes/bookingRoute");
const loginRoute = require("./routes/loginRoute");
const adminRoute = require("./routes/adminRoute");
const paymentRoute = require("./routes/paymentRoute");
const forgotPasswordRoute = require("./routes/forgotPasswordRoute");
const contactRoute = require("./routes/contactRoute");

dotenv.config({ path: path.join(__dirname, "../../.env") });

const app = express();
app.use(cors());
app.use(express.json());

// Skip CORS preflight requests from rate limit counts
const skipOptions = (req) => req.method === "OPTIONS";

const strictlyLimitedPaths = ["/api/login", "/api/forgot-password", "/api/contact"];
const skipForStrictPaths = (req) =>
    req.method === "OPTIONS" || strictlyLimitedPaths.some((p) => req.path.startsWith(p));

// General rate limit: 100 requests per 15 minutes per IP
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    skip: skipForStrictPaths,
    message: { error: "Too many requests, please try again later." },
});

// Strict limit for auth routes: 15 requests per 15 minutes per IP
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 15,
    standardHeaders: true,
    legacyHeaders: false,
    skip: skipOptions,
    message: { error: "Too many login attempts, please try again later." },
});

// Strict limit for email-sending routes: 5 requests per 15 minutes per IP
const emailLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    skip: skipOptions,
    message: { error: "Too many requests, please try again later." },
});

app.use("/api/bookings", bookingRoute);
app.use("/api/login", loginRoute);
app.use("/api/admin", adminRoute);
app.use("/api/payment", paymentRoute);
app.use("/api/forgot-password", forgotPasswordRoute);
app.use("/api/contact", contactRoute);

app.get("/api/test", (req, res) => {
    res.json({ message: "Backend-Frontend connected successfully"});
})

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
