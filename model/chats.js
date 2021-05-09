const mongoose = require("mongoose");

const ChatSchema = new mongoose.Schema(
  {
    sid: { type: String },
    pid: {
      type: String,
    },
    message: [
      {
        message: String,
        sender: {
          type: String,
        },
        time: { type: Date, default: new Date() },
      },
    ],
    peopleinchat: {
      type:Array
    },
  },
  { timestamp: true }
);

const Chats = mongoose.model("chats", ChatSchema);
module.exports = Chats;
