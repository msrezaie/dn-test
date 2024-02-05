const User = require("../models/User");
const Group = require("../models/Group");
const Message = require("../models/Message");

// @desc    Endpoint for fetching all messages
// @route   GET /api/v1/messages
// @access  signed in users only
const getAllMessages = async (req, res) => {
  const { groupID } = req.params;
  const userID = req.user._id;

  if (!(await Group.findOne({ _id: groupID, members: userID }))) {
    res.status(400);
    throw new Error(
      "Please provide a valid group ID that you are a member of!"
    );
  }

  const messages = await Message.find({ group: groupID }).populate(
    "sender",
    "name email"
  );
  return res.json({ count: messages.length, messages });
};

// @desc    Endpoint for sending a message to a group
// @route   POST /api/v1/messages
// @access  signed in users only
const sendMessage = async (req, res) => {
  const { message, groupID } = req.body;
  const userID = req.user._id;

  if (!message || !groupID) {
    res.status(400);
    throw new Error("Please provide a message and a valid group ID!");
  }
  if (!(await Group.findOne({ _id: groupID, members: userID }))) {
    res.status(400);
    throw new Error(
      "Please provide a valid group ID that you are a member of!"
    );
  }

  const newMessage = {
    sender: userID,
    message,
    group: groupID,
  };

  let savedMessage = await Message.create(newMessage);
  savedMessage = await Message.findOne({ _id: savedMessage._id })
    .populate("sender", "name email")
    .populate("group", "groupName members")
    .exec();

  res.status(201).json({ msg: "Message sent!", savedMessage });
};

// @desc    Endpoint for deleting all messages in a group
// @route   DELETE /api/v1/messages/:groupID
// @access  signed in users only
const purgeMessages = async (req, res) => {
  const { groupID } = req.params;
  if (!groupID) {
    res.status(400);
    throw new Error("Please provide a valid group ID!");
  }
  await Message.deleteMany({ group: groupID });
  res.status(200).json({ msg: "Messages deleted!" });
};

module.exports = { sendMessage, getAllMessages, purgeMessages };
