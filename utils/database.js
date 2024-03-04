require("dotenv").config();
const mysql = require("mysql2");

//use .env for storing and retrieving credential
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
});

const testConnection = () => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.error("Database connection failed:", err);
      return;
    }
    console.log("Database connection successful");
    connection.release();
  });
};

module.exports = {
  pool: pool.promise(),
  testConnection,
};
