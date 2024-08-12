const express = require("express");
const {
  createEvent,
  getEvents,
  getEventById,
  updateEventById,
  deleteEventById,
} = require("../models/event.model");
const router = express.Router();

// create event
router.post("/create", async (req, res) => {
  const {
    title,
    description,
    start_time,
    end_time,
    start_date,
    end_date,
    image_path,
    admin_id,
    participants_limit,
    address,
    postcode,
    state,
    city,
    category_id,
  } = req.body;
  try {
    const event = await createEvent(
      title,
      description,
      start_time,
      end_time,
      start_date,
      end_date,
      image_path,
      admin_id,
      participants_limit,
      address,
      postcode,
      state,
      city,
      category_id
    );
    res.status(201).send({ event });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

// get all events
router.get("/", async (req, res) => {
  try {
    const events = await getEvents();
    res.status(200).send({ events });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

//get event by ID
router.get("/:id", async (req, res) => {
  const eventId = req.params.id;

  try {
    const event = await getEventById(eventId);
    res.status(200).send({ event });
  } catch (error) {
    res.status(404).send({ error: error.message });
  }
});

// update event by ID
router.put("/:id", async (req, res) => {
  const eventId = req.params.id;
  const {
    title,
    description,
    start_time,
    end_time,
    start_date,
    end_date,
    image_path,
    admin_id,
    participants_limit,
    address,
    postcode,
    state,
    city,
    category_id,
  } = req.body;
  try {
    const message = await updateEventById(
      eventId,
      title,
      description,
      start_time,
      end_time,
      start_date,
      end_date,
      image_path,
      admin_id,
      participants_limit,
      address,
      postcode,
      state,
      city,
      category_id
    );
    res.status(200).send({ message });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

// delete event by ID
router.delete("/deleteEvent", async (req, res) => {
  const { eventId, userId } = req.query;
  try {
    const message = await deleteEventById(eventId, userId);
    res.status(200).send({ message });
  } catch (error) {
    res.status(404).send({ error: error.message });
  }
});

module.exports = router;
