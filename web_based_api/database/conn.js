const mysql = require('mysql2');
require("dotenv").config();

// Create a connection to the database
const connection = mysql.createConnection({
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.DBNAME,
});

const connectionPromise = mysql.createPool({
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.DBNAME,
});

// Export the connection for use in other files
module.exports = { connection, connectionPromise };
