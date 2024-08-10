require('dotenv').config();
const mysql = require('mysql2');

// Create a connection to the database
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'cwxcwx123123',
  database: 'event_community_app'
});

// Export the connection for use in other files
module.exports = connection;
