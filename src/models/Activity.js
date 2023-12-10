const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema(
  {
    activity: {
      type: String,
      required: [true, "please provide a brief description for the activity!"],
    },
    type: {
      type: String,
      default: "a default activity type",
      required: [true, "please provide a type for the activity!"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Activity", activitySchema);
