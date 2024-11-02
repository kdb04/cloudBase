const connection = require("./db");

connection.query("SELECT 1+1 AS solution", (err, results) => {
    if(err){
        console.error("Error executing query:", err);
        return;
    }
    console.log("Database connected. Test query result:", results[0].solution);
    connection.end();
});
