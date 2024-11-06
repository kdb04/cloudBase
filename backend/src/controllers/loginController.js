const db = require("../connection/db.js");

const userLogin = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }

    const userCheck = `SELECT * FROM users WHERE email=?`;

    db.query(userCheck, [email], (error, results) => {
        if (error) {
            return res.status(500).json({ message: "Database error", error });
        }

        console.log("Query results:", results); 

        if (results.length > 0) {
            const user = results[0];

            if (user.password !== password) {
                return res.status(401).json({ message: "Invalid password" });
            }
            
            console.log("Login successful");
            return res.status(200).json({ message: "Login successful", user });
        } else {
            
            console.log("User not found, creating new user");

            const insertQuery = `INSERT INTO users (email, password) VALUES (?, ?)`;
            db.query(insertQuery, [email, password], (insertError, insertResults) => {
                if (insertError) {
                    return res.status(500).json({ message: "Database error", insertError });
                }
                
                console.log("User created successfully");
                return res.status(201).json({ message: "User created successfully", user: { email, password } });
            });
        }
    });
};

module.exports = { userLogin };
