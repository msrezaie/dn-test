const express = require("express");
const router = express.Router();

const { saveGroup } = require("../controllers/groupsController");

const { authenticateUser } = require("../middleware/authHandler");

router.post("/", authenticateUser, saveGroup);

module.exports = router;
