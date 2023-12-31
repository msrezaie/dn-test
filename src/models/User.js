const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const validator = require("validator");

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "please provide a name!"],
    },
    email: {
      type: String,
      required: [true, "please provide an email!"],
      validate: {
        validator: validator.isEmail,
        message: "Please provide a valid email!",
      },
      unique: true,
    },
    password: {
      type: String,
      required: [true, "please provide a password!"],
      minlength: [8, "password must be at least 8 characters long!"],
      select: false,
    },
  },
  { timestamps: true }
);

// Middlware function responsible for hashing the password using bcrypt
userSchema.pre("save", async function () {
  const salt = await bcrypt.genSalt();
  this.password = await bcrypt.hash(this.password, salt);
});

// A User model method for validating inputted user password
userSchema.methods.comparePassword = async function (inputtedPassword) {
  return await bcrypt.compare(inputtedPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
