const express = require("express");
const router = express.Router();

const {
  getAllEvents,
  getEvent,
  saveEvent,
  updateEvent,
  deleteEvent,
} = require("../controllers/eventsController");

// @route   GET /api/v1/events
router.get("/", getAllEvents);

// @route   GET /api/v1/events/:_id
router.get("/:_id", getEvent);

// @route   PUT /api/v1/events/:_id
router.put("/:_id", updateEvent);

// @route   POST /api/v1/events
router.post("/", saveEvent);

// @route   DELETE /api/v1/events/:_id
router.delete("/:_id", deleteEvent);

module.exports = router;
