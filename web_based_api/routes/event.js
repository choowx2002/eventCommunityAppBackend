const express = require("express");
const {
  createEvent,
  getEvents,
  getEventById,
  updateEventById,
  deleteEventById,
  getEventsByCatId,
  getEventsByState,
  joinEvent,
  leaveEvent,
  checkLatest,
  checkIsJoin,
  getParticipants,
  getEventsByTitle,
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

router.get("/search", async (req, res) => {
  const title = req.query.title;

  try {
    const events = await getEventsByTitle(title);
    res.status(200).send({ status: "success", data: { events } });
  } catch (error) {
    res.status(400).send({ status: "error", message: error.message });
  }
});

//get event by ID
router.get("/:id", async (req, res) => {
  const event_id = req.params.id;
  const {user_id} = req.query;
  let data = {};
  try {
    data.event = await getEventById(event_id);
    if(user_id) {
      data.isJoined = await checkIsJoin(user_id, event_id)
    }
    res.status(200).send({ status: "success", data });
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

router.post("/join", async (req, res) => {
  const { user_id, event_id } = req.body;
  try {
    const message = await joinEvent(user_id, event_id);
    res.status(201).send(message);
  } catch (error) {
    res.status(400).send({ status: "error", message: error.message });
  }
});

router.delete("/leave", async (req, res) => {
  const { user_id, event_id } = req.query;
  try {
    const message = await leaveEvent(user_id, event_id);
    res.status(201).send({ status: "success", data: { message } });
  } catch (error) {
    res.status(400).send({ status: "error", message: error.message });
  }
});

router.get("/checkLatest/:id", async (req, res) => {
  const event_id = req.params.id;
  const { updated_at } = req.query;
  try {
    const data = await checkLatest(event_id, updated_at);
    res.status(201).send({ status: "success", data });
  } catch (error) {
    res.status(400).send({ status: "error", message: error.message });
  }
});

router.get("/participants/:id", async (req, res) => {
  const event_id = req.params.id;
  try {
    await getEventById(event_id);
    const data = await getParticipants(event_id);
    res.status(201).send({ status: "success", data });
  } catch (error) {
    res.status(400).send({ status: "error", message: error.message });
  }
});

module.exports = router;
