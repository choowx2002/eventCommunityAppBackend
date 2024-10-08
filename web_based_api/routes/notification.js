const express = require("express");
const {
  createNotification,
  getNotificationById,
  getNotificationsByEventId,
  getNotificationsByUserId,
} = require("../models/notification.model");
const router = express.Router();

//create notification
router.post("/create", async (req, res) => {
  console.log("run");
  const { title, message, event_id } = req.body;
  try {
    const notification = await createNotification(title, message, event_id);
    res.status(201).send({ status: "success", data: { notification } });
  } catch (error) {
    res.status(400).send({ status: "error", message: error.message });
  }
});

//get notification by id
router.get("/:id", async (req, res) => {
  const notificationId = req.params.id;

  try {
    const notification = await getNotificationById(notificationId);
    res.status(200).send({ status: "success", data: { notification } });
  } catch (error) {
    res.status(404).send({ status: "error", message: error.message });
  }
});

//get notification by event id
router.get("/event/:id", async (req, res) => {
  const eventId = req.params.id;

  try {
    const notifications = await getNotificationsByEventId(eventId);
    res.status(200).send({ status: "success", data: { notifications } });
  } catch (error) {
    res.status(404).send({ status: "error", message: error.message });
  }
});

//get notification by user id
router.get("/user/:id", async (req, res) => {
  const userId = req.params.id;
  const { read_from } = req.query; //timestamp
  try {
    const notifications = await getNotificationsByUserId(userId, read_from);
    res.status(200).send({ status: "success", data: { notifications } });
  } catch (error) {
    res.status(404).send({ status: "error", message: error.message });
  }
});

module.exports = router;
