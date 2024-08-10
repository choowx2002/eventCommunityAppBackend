const { MongoClient } = require("mongodb");

const connectionString = process.env.MONGODB_URI || "";

const client = new MongoClient(connectionString);
async function connectToDatabase() {
  try {
    await client.connect();
    console.log('Connected to database');
    return client.db('event_community_app')
  } catch (e) {
    console.error('Error connecting to database:', e);
    process.exit(1);
  }
}

module.exports = {connectToDatabase};
