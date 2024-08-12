const express = require("express");
const {
  createNotification,
  getNotificationById,
  getNotificationsByEventId,
  getNotificationsByUserId
} = require("../models/notification.model");
const router = express.Router();


router.post("/create", async (req, res) => {
  console.log("run")
  const { title, message, event_id } = req.body;
  try {
    const notification = await createNotification(
      title,
      message,
      event_id,
    );
    res.status(201).send({ notification });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

router.get("/:id", async (req, res) => {
  const notificationId = req.params.id;

  try {
    const event = await getNotificationById(notificationId);
    res.status(200).send({ event });
  } catch (error) {
    res.status(404).send({ error: error.message });
  }
});

router.get("/event/:id", async (req, res) => {
  const eventId = req.params.id;

  try {
    const notification = await getNotificationsByEventId(eventId);
    res.status(200).send({ notification });
  } catch (error) {
    res.status(404).send({ error: error.message });
  }
});

router.get("/user/:id", async (req, res) => {
  const userId = req.params.id;
  const {read_from} = req.params;

  try {
    const notification = await getNotificationsByUserId(userId, read_from);
    res.status(200).send({ notification });
  } catch (error) {
    res.status(404).send({ error: error.message });
  }
});

module.exports = router;

