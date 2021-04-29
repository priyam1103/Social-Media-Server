const express = require("express");

const route = express.Router();
const {
  addPost,
  getPosts,
  getStories,
  getPostById,
  likePost,
  dislikePost,
  addComment,
    addStory,
  getWallPosts
} = require("../handlers/posts");
const auth = require("../middleware/auth");

route.post("/post", auth, addPost);
route.post("/story", auth, addStory);
route.get("/getpost/:postid", auth, getPostById);
route.get("/getposts", auth, getPosts);
route.get("/getwallposts", auth, getWallPosts);

route.get("/getstories", auth, getStories);
route.put("/like/:postid", auth, likePost);
route.put("/dislike/:postid", auth, dislikePost);
route.post("/comment", auth, addComment);

module.exports = route;
