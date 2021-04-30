const express = require("express");
const path = require("path");
const http = require("http");
const socketio = require("socket.io");
const formatMessage = require("./utils/message");
const {
  userJoin,
  getCurrentUser,
  userLeaves,
  getRoomUsers,
} = require("./utils/users");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

//set static folder
app.use(express.static(path.join(__dirname, "public")));

const botName = "Admin";
//run when client connects
io.on("connection", (socket) => {
  //listen to joinroom
  socket.on("joinroom", ({ username, room }) => {
    //user joins room
    const user = userJoin(socket.id, username, room);

    socket.join(user.room);

    //when user joins
    socket.emit("message", formatMessage(botName, "welcome")); //to the new user connected
    //broadcast when user connects to the rest
    //io.emit();broadcast to everyone plus the new user
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        formatMessage(botName, `${user.username} has joined the chat`)
      );
    //send users and room info
    io.to(user.room).emit("roomUsers", {
      room: user.room,
      users: getRoomUsers(user.room)
    });
  });
  //listen for chatMessage
  socket.on("chatMessage", (msg) => {
    const user = getCurrentUser(socket.id);
    //share to everyone
    io.to(user.room).emit("message", formatMessage(user.username, msg));
  });

  //when user disconnetcs
  socket.on("disconnect", () => {
    const user = userLeaves(socket.id);
    if (user) {
      io.to(user.room).emit(
        "message",
        formatMessage(botName, `${user.username} has left the chat`)
      );
    //send users and room info
    io.to(user.room).emit("roomUsers", {
      room: user.room,
      users: getRoomUsers(user.room)
    });
    } 
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`server running on port ${PORT}`));
