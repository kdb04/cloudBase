const bcrypt = require("bcrypt");
const db = require("./connection/db.js");

const hashExistingPasswords = async () => {
    const getUsers = `SELECT user_id, password FROM users`;

    db.query(getUsers, async (error, users) => {
        if (error){
            console.error("Error getting user data:", error);
            return;
        }

        for (const user of users){
            try{
                const hashedPassword = await bcrypt.hash(user.password, 10);

                const updateQuery = `UPDATE users SET password = ? WHERE user_id = ?`;

                db.query(updateQuery, [hashedPassword, user.user_id], (updateError) => {
                    if (updateError){
                        console.error(`Error updating user ${user.user_id}:`, updateError);
                    }
                    else{
                        console.log(`User ${user.user_id} password encrypted successfully`);
                    }
                });
            }
            catch(err){
                console.error("Error hashing for user:", err);
            }
        }
    });
};

hashExistingPasswords();
