const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { v4: uuidv4 } = require("uuid");
const config = require("../service/config");
const UserSchema = new mongoose.Schema(
  {
    image: {
      type: String,
      default:"https://www.kindpng.com/picc/m/252-2524695_dummy-profile-image-jpg-hd-png-download.png"
    },
    username: {
      type: String,
      unique: true,
    },
    name: {
      type: String,
      default: "",
    },
    password: {
      type: String,
      required: true,
    },
    website: {
      type: String,
      default: "",
    },
    bio: {
      type: String,
      default: "",
    },
    emailId: {
      type: String,
      required: true,
      unique: true,
    },
    mobileNo: {
      type: String,
      default: "",
    },
    verified: {
      type: Boolean,
      default: false,
    },
    verification: {
      otp: {
        type: String,
        default: () => Math.floor(100000 + Math.random() * 900000),
      },
    },
    resetPassword: {
      token: {
        type: String,
        default: null,
      },
      expireIn: {
        type: Date,
        default: null,
      },
    },
    socketId: {
      type: String,
      default: null,
    },
    posts: {
      type: Array,
      default: [],
    },
    stories: {
      type: Array,
      default: [],
    },
    followers: {
      type: Array,
      default: [],
    },
    following: {
      type: Array,
      default: [],
    },
    likedposts: {
      type: Array,
      default: [],
    },
    notifications: {
      type: Array,
      default: [],
    }
  },
  { timestamps: true }
);

UserSchema.method("generateAuthToken", async function () {
  const user = this;
  const token = jwt.sign(
    { id: user._id, emailId: user.emailId },
    config.JWT_SECRET
  );
  return token;
});

UserSchema.method("generateResetPasswordToken", async function () {
  const user = this;
  user.resetPassword.token = crypto.randomBytes(20).toString("hex");
  user.resetPassword.expireIn = Date.now() + 60 * 60 * 1000;
  user.save();
  return user.resetPassword.token;
});

const User = mongoose.model("User", UserSchema);
module.exports = User;
