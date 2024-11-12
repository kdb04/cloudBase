const db = require("./connection/db.js");

const authAdmin = (req, res, next) => {
    const userEmail = req.user?.email || req.body.userEmail;

    if (!userEmail) {
        return res.status(400).json({ message: "Email is required for authorization" });
    }

    const adminEmail = "admin@example.com";

    const query = "SELECT email FROM users WHERE email = ?";
    db.query(query, [userEmail], (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ message: "Internal server error" });
        }

        if (results.length === 0 || results[0].email !== adminEmail) {
            console.log("Unauthorized access attempted by:", userEmail);
            return res.status(403).json({ message: "Access denied. Admins only." });
        }

        console.log("Admin access granted to:", userEmail);
        next();
    });
};

module.exports = authAdmin;
