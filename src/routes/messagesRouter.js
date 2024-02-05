const express = require("express");
const router = express.Router();

const {
  sendMessage,
  getAllMessages,
  purgeMessages,
} = require("../controllers/messagesController");

// @route   POST /api/v1/messages
router.route("/").post(sendMessage);

// @route   GET /api/v1/messages/:groupID
router.route("/:groupID").get(getAllMessages);

// @route   DELETE /api/v1/messages/:groupID
router.route("/:groupID").delete(purgeMessages);

module.exports = router;
