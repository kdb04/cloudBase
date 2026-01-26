const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; //Expected format: "Bearer TOKEN"

    if (!token) return res.status(401).json({ message: "Access denied. Token missing." });

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: "Invalid or missing token." });
        req.user = user; //attach user to payload
        next();
    });
};

module.exports = authenticateToken;
