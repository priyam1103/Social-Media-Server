const mongoose = require("mongoose");

const StorySchema = new mongoose.Schema(
  {
    image: {
      type: String,
    },
    caption: {
      type: String,
    },
    user_image: {
      type: String,
    },
    user_name: {
      type: String,
    },
    ofUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
  },
  { timestamp: true }
);

const Stories = mongoose.model("Story", StorySchema);
module.exports = Stories;
