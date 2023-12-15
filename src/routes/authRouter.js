const express = require("express");
const router = express.Router();
const {
  signup,
  login,
  logout,
  getCurrentUser,
} = require("../controllers/authController");

const { authenticateUser } = require("../middleware/authHandler");

// @route   POST /api/v1/auth/signup
router.post("/signup", signup);

// @route   POST /api/v1/auth/login
router.route("/login").post(login);

// @route   POST /api/v1/auth/logout
router.route("/logout").post(logout);

// @route   GET /api/v1/auth/getCurrentUser
router.route("/getCurrentUser").get(authenticateUser, getCurrentUser);

module.exports = router;
