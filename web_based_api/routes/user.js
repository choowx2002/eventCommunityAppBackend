const express = require("express");
const {
  getUsers,
  createUser,
  getUserById,
  deleteUserById,
  getUserEvents,
} = require("../models/user.model");
const router = express.Router();

router.post("/create", async (req, res) => {
  const { email, password, first_name, last_name, birth, gender } = req.body;

  try {
    const userId = await createUser(
      email,
      password,
      first_name,
      last_name,
      birth,
      gender
    );
    res.status(201).send({ userId: userId });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

router.get("/all", async (req, res) => {
  try {
    const users = await getUsers();
    res.status(201).send({ users });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

router.get("/userById/:id", async (req, res) => {
  const userId = req.params.id;

  try {
    const user = await getUserById(userId);
    res.status(201).send({ user });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

router.delete("/delete/:id", async (req, res) => {
  const userId = req.params.id;

  try {
    const message = await deleteUserById(userId);
    res.status(201).send({ message });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

router.get("/userEvents", async (req, res) => {
  const {userId, eventType} = req.query;
  try {
    console.log("runrun2")
    const userEvents = await getUserEvents(userId, eventType);
    res.status(201).send({ userEvents });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

module.exports = router;
