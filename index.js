const express = require("express");
var cors = require("cors");
const fileUpload = require("express-fileupload");
const app = express();
const User = require("./model/user");
const Chats = require("./model/chats");
const http = require("http");
const jwt = require("jsonwebtoken");
const server = http.createServer(app);
const io = require("socket.io")(server);
const config = require("./service/config");
const { connectDb } = require("./service/db");
app.use(fileUpload());
app.use(cors());
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
require("./service/routes")(app);

connectDb().then(() => {
  server.listen(config.PORT, () => {
    console.log(`Connected to port ${config.PORT}`);
  });
});
function getIndex(arr, val) {
  var index;
  for (var j = 0; j < arr.length; j++) {
    console.log(arr[j].id, val);
    if (arr[j].id == val) {
      index = j;
      break;
    }
  }
  return index;
}
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.query.token;
    if (token != "null") {
      const decoded = await jwt.verify(token, config.JWT_SECRET);
      const user = await User.findOne({ _id: decoded.id });
      console.log("connected");
      if (!user) {
      } else {
        socket.user = user;
        next();
      }
    } else {
      //throw Error()
    }
  } catch (err) {
    console.log(err);
  }
});
io.on("connection", async (socket) => {
  const user = await User.findOneAndUpdate(
    { _id: socket.user._id },
    { $set: { socketId: socket.id } },
    { upsert: true }
  );
  socket.user = user;
  socket.on("getpastchatlist", async (data, callback) => {
    try {
      const userid = socket.user._id;
      if (data.pid == userid) {
        const chatlist = await Chats.find({
          $or: [{ sid: userid }, { pid: userid }],
        });
        callback({ chatlist });
      } else {
        callback({ error: true });
      }
    } catch (err) {
      console.log(err);
      callback({ error: true });
    }
  });
  socket.on("getchats", async (data, callback) => {
    try {
      const chats = await Chats.findById(data.chatid);
      if (chats) {
        socket.join(chats._id);
        // console.log(socket.rooms, "joining", chats._id);
        callback({ chats });
      } else {
        callback({ error: true });
      }
    } catch (err) {
      console.log(err);
      callback({ error: true });
    }
  });
  socket.on("sendmessage", async (data, callback) => {
    try {
      const chat = await Chats.findById(data.chatid);
      if (chat) {
        const updated_chats = chat.message.concat({
          message: data.message,
          sender: socket.user._id,
          time: new Date(),
        });
        const newchat = await Chats.findOneAndUpdate(
          {
            _id: chat._id,
          },
          {
            message: updated_chats,
          },
          { new: true }
        );

        io.to(chat._id).emit("recievemessage", {
          chats: newchat,
        });
        callback({ success: true });
      }
    } catch (err) {
      console.log(err);
      callback({ error: true });
    }
  });
  socket.on("leavechatroom", async function (data, callback) {
    socket.leave(data.chatid);
    // console.log(socket.rooms, "leaving", data.chatid);
  });
  socket.on("starttyping", async function (data) {
    const chat = await Chats.findById(data.chatid);
    const f = getIndex(chat.peopleinchat, socket.user.id);
    console.log(f);
    chat.peopleinchat[f].typing = true;
    const chat_ = await Chats.findOneAndUpdate(
      { _id: data.chatid },
      {
        $set: {
          peopleinchat: chat.peopleinchat,
        },
      },
      { new: true }
    );
    io.to(data.chatid).emit("startedtyping", { chats: chat_ });
  });
  socket.on("stoptyping", async function (data) {
    const chat = await Chats.findById(data.chatid);
    const f = getIndex(chat.peopleinchat, socket.user.id);
    chat.peopleinchat[f].typing = false;
    const chat_ = await Chats.findOneAndUpdate(
      { _id: data.chatid },
      {
        $set: {
          peopleinchat: chat.peopleinchat,
        },
      },
      { new: true }
    );
    io.to(data.chatid).emit("stoppedtyping", { chats: chat_ });
  });

  socket.on("disconnect", () => {});
});
