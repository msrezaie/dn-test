const Group = require("../models/Group");
const Event = require("../models/Event");
const EventActivity = require("../models/EventActivity");

// @desc    Endpoint for fetching all events
// @routes  GET /api/v1/events
//          GET /api/v1/events?host=true
// @access  signed in users only
const getAllEvents = async (req, res) => {
  const userID = req.user._id;
  const { host } = req.query;

  const findCriteria = host === "true" ? { host: userID } : {};

  const response = await Event.find(findCriteria).populate("activities");

  return res.json({ count: response.length, events: response });
};

// @desc    Endpoint for fetching a single event
// @route   GET /api/v1/events/:_id
// @access  signed in users only
const getEvent = async (req, res) => {
  const { _id } = req.params;

  const event = await Event.findOne({ _id })
    .populate({
      path: "activities",
      select: "_id eventID activity type votes",
    })
    .populate({
      path: "participants",
      select: "_id name email",
    })
    .populate({
      path: "host",
      select: "_id name email",
    })
    .populate({
      path: "chosenActivity",
      select: "_id activity type",
    });
  if (!event) {
    res.status(404);
    throw new Error(`Event with ${_id} ID does not exist!`);
  }

  return res.json(event);
};

// @desc    Endpoint for creating an event
// @route   POST /api/v1/events
// @access  signed in users only
const saveEvent = async (req, res) => {
  let { groupID, name, description, eventDateTime, activities } = req.body;
  const userID = req.user._id;

  if (!groupID || !(await Group.findOne({ _id: groupID }))) {
    res.status(400);
    throw new Error(
      "A valid 'groupID' value must be provided in order to link the event to its group!"
    );
  }
  if (!name) {
    res.status(400);
    throw new Error("Event must have a name!");
  }
  if (!eventDateTime) {
    res.status(400);
    throw new Error("Event must have a date and time!");
  }
  if (activities) {
    const isValidActivities =
      Array.isArray(activities) &&
      activities.every((activity) => {
        return (
          activity.hasOwnProperty("activity") && activity.hasOwnProperty("type")
        );
      });
    if (!isValidActivities) {
      res.status(400);
      throw new Error(
        "Invalid 'activities' format. An array of at least one activity object that must have 'activity' and 'type' properties!"
      );
    }
  }
  const savedEvent = new Event({
    groupID,
    name,
    host: userID,
    eventDateTime,
    description,
  });
  activities = activities.map((element) => {
    return { eventID: savedEvent._id, ...element };
  });
  const savedEventActivities = await EventActivity.create(activities);
  for (activity of savedEventActivities) {
    savedEvent.activities.push(activity._id);
  }
  await savedEvent.save();

  return res.json({ msg: "Event saved!", savedEvent });
};

// @desc    Endpoint for updating an event
// @route   PUT /api/v1/events/:_id
//          PUT /api/v1/events/:_id?chosenActivity=activityID
// @access  signed in users only
const updateEvent = async (req, res) => {
  const { _id } = req.params;
  const { chosenActivity } = req.query;

  if (chosenActivity) {
    const eventActivity = await EventActivity.findOne({
      _id: chosenActivity,
      eventID: _id,
    });
    if (!eventActivity) {
      res.status(404);
      throw new Error("Event or Activity not found!");
    }

    const updatedEvent = await Event.findOneAndUpdate(
      { _id, host: req.user.userID },
      {
        chosenActivity: eventActivity._id,
      },
      { new: true }
    );

    if (!updatedEvent) {
      res.status(403);
      throw new Error(
        "An error occurred: you do not have permission to perform this action!"
      );
    }

    return res.json({
      msg: `${eventActivity.activity} got chosen as the activity of the event!`,
      updatedEvent,
    });
  }

  let { name, description, eventDateTime, activities } = req.body;
  let newActivityIDs = [];
  if (activities) {
    const isValidActivities =
      Array.isArray(activities) &&
      activities.every((activity) => {
        return (
          activity.hasOwnProperty("activity") && activity.hasOwnProperty("type")
        );
      });
    if (!isValidActivities) {
      res.status(400);
      throw new Error(
        "Invalid 'activities' format. An array of at least one activity object that must have 'activity' and 'type' properties!"
      );
    }
    activities = activities.map((element) => {
      return { eventID: _id, ...element };
    });

    const savedEventActivities = await EventActivity.create(activities);

    newActivityIDs = savedEventActivities.map((activity) => activity._id);
  }

  const newEvent = await Event.findOneAndUpdate(
    { _id, host: req.user._id },
    {
      name,
      description,
      eventDateTime,
      $push: {
        activities: newActivityIDs,
      },
    },
    { new: true }
  );

  if (!newEvent) {
    res.status(400);
    throw new Error(
      "An error occurred: the event does not exist or you do not have permission to perform this action!"
    );
  }

  return res.json({
    msg: "Event updated!",
    newEvent,
  });
};

// @desc    Endpoint for deleting a an event
// @route   DELETE /api/v1/events/:_id
// @access  signed in users only
const deleteEvent = async (req, res) => {
  const { _id } = req.params;
  const event = await Event.findOneAndDelete({ _id });
  if (!event) {
    res.status(404);
    throw new Error(`Event with ${_id} ID does not exist!`);
  }
  await Group.updateOne(
    { _id: event.groupID },
    { $pull: { groupEvents: event._id } }
  );

  await EventActivity.deleteMany({ eventID: event._id });

  return res.json({ msg: `Successfully removed event with ID: ${_id}!` });
};

module.exports = {
  getAllEvents,
  getEvent,
  saveEvent,
  deleteEvent,
  updateEvent,
};
