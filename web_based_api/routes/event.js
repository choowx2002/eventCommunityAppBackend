const express = require("express");
const {
  createEvent,
  getEvents,
  getEventById,
  updateEventById,
  deleteEventById,
  getEventsByCatId,
  getEventsByState,
} = require("../models/event.model");
const { getCategorieNameById } = require("../models/category.model");
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
    res.status(201).send({ status: "success", data: { event } });
  } catch (error) {
    res.status(400).send({ status: "error", message: error.message });
  }
});

// get all events
router.get("/", async (req, res) => {
  const { limit } = req.query;
  try {
    const events = await getEvents(limit);
    res.status(200).send({ status: "success", data: { events, limit } });
  } catch (error) {
    res.status(400).send({ status: "error", message: error.message });
  }
});

//get event by ID
router.get("/:id", async (req, res) => {
  const eventId = req.params.id;

  try {
    const event = await getEventById(eventId);
    res.status(200).send({ status: "success", data: { event } });
  } catch (error) {
    res.status(400).send({ status: "error", error: error.message });
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
    const event = await updateEventById(
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
    res.status(200).send({ status: "success", data: { event } });
  } catch (error) {
    res.status(400).send({ status: "error", error: error.message });
  }
});

// delete event by ID
router.delete("/deleteEvent", async (req, res) => {
  const { eventId, userId } = req.query;
  try {
    const message = await deleteEventById(eventId, userId);
    res.status(200).send({ status: "success", data: { message } });
  } catch (error) {
    res.status(400).send({ status: "error", message: error.message });
  }
});

router.get("/category/id", async (req, res) => {
  const { category_id, limit } = req.query;

  try {
    const events = await getEventsByCatId(category_id, limit);
    const category = await getCategorieNameById(category_id);
    res
      .status(200)
      .send({ status: "success", data: { events, category: category?.[0] } });
  } catch (error) {
    res.status(400).send({ status: "error", message: error.message });
  }
});

router.get("/state/name", async (req, res) => {
  const { state, limit } = req.query;

  try {
    const events = await getEventsByState(state, limit);
    res.status(200).send({ status: "success", data: { events } });
  } catch (error) {
    res.status(400).send({ status: "error", message: error.message });
  }
});

module.exports = router;
