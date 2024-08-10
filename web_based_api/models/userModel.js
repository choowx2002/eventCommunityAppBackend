const {connectToDatabase} = require('../database/conn.js')


async function getUsers() {
  const db = await connectToDatabase();
  const users = db.collection('users');
  return await users.find({}).toArray(); 
}

async function createUser(user) {
  const db = await connectToDatabase();
  const users = db.collection('users');
  await users.insertOne(user); 
}

async function getUserById(id) {
  const db = await connectToDatabase();
  const users = db.collection('users');
  return await users.findOne({ userId: id });
}

module.exports = { getUsers, createUser, getUserById};
