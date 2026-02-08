const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../connection/db.js");

const userLogin = async (req, res) => {
    const { email, password } = req.body;
    console.log(`[LOGIN] Attempt for email: ${email}`);

    if (!email || !password) return res.status(400).json({ message: "Email and password are required" });
    
    const checkBlackListQuery = "CALL GetBlacklistedUsers()";

    db.query(checkBlackListQuery, (error, blacklistedUsers) => {
        if (error) return res.status(500).json({ message: "Database error", error});

        //console.log("Blacklisted users fetched successfully:", blacklistedUsers[0]);

        const isBlackListed = blacklistedUsers[0].some(user => user.email === email);
        if (isBlackListed){
            console.log(`[LOGIN] BLOCKED - Blacklisted email: ${email}`);
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
                if (!passwordMatch) {
                    console.log(`[LOGIN] FAILED - Invalid password for: ${email}`);
                    return res.status(401).json({ message: "Invalid password "});
                }

                const token = jwt.sign(
                    { id: user.id, email: user.email },
                    process.env.JWT_SECRET,
                    { expiresIn: '1h' }
                );

                console.log(`[LOGIN] SUCCESS - User logged in: ${email}`);
                console.log(`[TOKEN] JWT issued for: ${email} | Token: ${token.substring(0, 20)}...`);
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

                    console.log(`[CREATE] New user registered: ${email} (ID: ${insertResults.insertId})`);
                    console.log(`[TOKEN] JWT issued for: ${email} | Token: ${token.substring(0, 20)}...`);
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

const userSignup = async (req, res) => {
    const { email, password } = req.body;
    console.log(`[SIGNUP] Attempt for email: ${email}`);

    if (!email || !password) return res.status(400).json({ message: "Email and password are required" });

    const checkBlackListQuery = "CALL GetBlacklistedUsers()";

    db.query(checkBlackListQuery, (error, blacklistedUsers) => {
        if (error) return res.status(500).json({ message: "Database error", error });

        const isBlackListed = blacklistedUsers[0].some(user => user.email === email);
        if (isBlackListed) {
            console.log(`[SIGNUP] BLOCKED - Blacklisted email: ${email}`);
            return res.status(403).json({ message: "This email is blacklisted. Registration denied." });
        }

        const userCheck = `SELECT * FROM users WHERE email=?`;

        db.query(userCheck, [email], async (error, results) => {
            if (error) return res.status(500).json({ message: "Database error", error });

            if (results.length > 0) {
                console.log(`[SIGNUP] FAILED - User already exists: ${email}`);
                return res.status(409).json({ message: "User already exists. Please login instead." });
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            const insertQuery = `INSERT INTO users (email, password) VALUES (?, ?)`;

            db.query(insertQuery, [email, hashedPassword], (insertError, insertResults) => {
                if (insertError) return res.status(500).json({ message: "Database error", insertError });

                const token = jwt.sign(
                    { id: insertResults.insertId, email },
                    process.env.JWT_SECRET,
                    { expiresIn: '1h' }
                );

                console.log(`[SIGNUP] SUCCESS - New user registered: ${email} (ID: ${insertResults.insertId})`);
                console.log(`[TOKEN] JWT issued for: ${email} | Token: ${token.substring(0, 20)}...`);
                return res.status(201).json({
                    message: "Account created successfully",
                    token,
                    user: { id: insertResults.insertId, email }
                });
            });
        });
    });
};

const userLogout = (req, res) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log(`[LOGOUT] User logged out: ${decoded.email}`);
            console.log(`[TOKEN] JWT invalidated for: ${decoded.email} | Token: ${token.substring(0, 20)}...`);
        } catch (err) {
            console.log(`[LOGOUT] Token expired or invalid`);
        }
    }

    return res.status(200).json({ message: "Logged out successfully" });
};

module.exports = { userLogin, userSignup, userLogout };
