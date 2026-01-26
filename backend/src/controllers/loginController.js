const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../connection/db.js");

const userLogin = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) return res.status(400).json({ message: "Email and password are required" });
    
    const checkBlackListQuery = "CALL GetBlacklistedUsers()";

    db.query(checkBlackListQuery, (error, blacklistedUsers) => {
        if (error) return res.status(500).json({ message: "Database error", error});

        //console.log("Blacklisted users fetched successfully:", blacklistedUsers[0]);

        const isBlackListed = blacklistedUsers[0].some(user => user.email === email);
        if (isBlackListed){
            //console.log(`Login attempt blocked for blacklisted email: ${email}`);
            return res.status(403).json({ message: "This account is blacklisted. Access denied."});
        }

        const userCheck = `SELECT * FROM users WHERE email=?`;

        db.query(userCheck, [email], async (error, results) => {
            if (error) return res.status(500).json({ message: "Database error", error });

            //console.log("Query results:", results);

            if (results.length > 0) {
                const user = results[0];

                /*if (user.password !== password) {
                    return res.status(401).json({ message: "Invalid password" });
                }*/

                const passwordMatch = await bcrypt.compare(password, user.password);
                if (!passwordMatch) return res.status(401).json({ message: "Invalid password "});

                const token = jwt.sign(
                    { id: user.id, email: user.email },
                    process.env.JWT_SECRET,
                    { expiresIn: '1h' }
                );

                //console.log("Login successful");
                return res.status(200).json({ 
                    message: "Login successful",
                    token,
                    user: { id: user.id, email: user.email }
                });
            }
            else {

                //console.log("User not found, creating new user");

                const hashedPassword = await bcrypt.hash(password, 10);

                const insertQuery = `INSERT INTO users (email, password) VALUES (?, ?)`;

                db.query(insertQuery, [email, hashedPassword], (insertError, insertResults) => {
                    if (insertError) return res.status(500).json({ message: "Database error", insertError });

                    const token = jwt.sign(
                        { id: insertResults.insertId, email },
                        process.env.JWT_SECRET,
                        { expiresIn: '1h' }
                    );

                    //console.log("User created successfully");
                    return res.status(201).json({ 
                        message: "User created successfully",
                        token,
                        user: { email }
                    });
                });
            }
        });
    });
};

module.exports = { userLogin };
