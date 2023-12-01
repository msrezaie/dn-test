const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "please provide an activity name!"],
    },
    description: {
      type: String,
      default: "a default event description",
    },
    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      unique: true,
    },
    activities: [{ type: mongoose.Schema.Types.ObjectId, ref: "Activity" }],
  },

  { timestamps: true }
);

module.exports = mongoose.model("Event", eventSchema);
