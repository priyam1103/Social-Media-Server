const express = require("express");

const route = express.Router();
const { updateUser,getUsers,getProfile,followunfollow,getcreateChat } = require("../handlers/users");
const auth = require("../middleware/auth");

route.post("/updateUser", auth, updateUser);
route.get("/getusers/:uname", auth, getUsers);
route.get("/getprofiles/:uname", auth, getProfile);
route.post("/followunfollow", auth, followunfollow);
route.post('/getchatid',auth,getcreateChat)

module.exports = route;
