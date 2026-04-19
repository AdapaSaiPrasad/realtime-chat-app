require("dotenv").config()
const app=require('./src/app')
const { Server } = require("socket.io");
const http = require("http");

const server = http.createServer(app);

// socket setup
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});


const users = {};
app.set("io", io);
app.set("users", users);
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // user joins (send userId from frontend)
  socket.on("join", (userId) => {
    users[userId] = socket.id;
    console.log("Users:", users);
    // send updated online users to all clients
     io.emit("onlineUsers", Object.keys(users));
  });
  socket.on("typing", (data) => {
  const { receiverId, senderId } = data;

  const receiverSocketId = users[receiverId];

  if (receiverSocketId && receiverId !== senderId) {
    io.to(receiverSocketId).emit("typing", { senderId });
  }
});
socket.on("stopTyping", (data) => {
  const { receiverId, senderId } = data;

  const receiverSocketId = users[receiverId];

  if (receiverSocketId && receiverId !== senderId) {
    io.to(receiverSocketId).emit("stopTyping", { senderId });
  }
});

  // send message to specific user
  socket.on("sendMessage", (data) => {
    const { receiverId, message } = data;

    const receiverSocketId = users[receiverId];

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("receiveMessage", data);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);

    // remove user
    for (let userId in users) {
      if (users[userId] === socket.id) {
        delete users[userId];
      }
    }
    // update all clients
  io.emit("onlineUsers", Object.keys(users));
  });
});


const port=process.env.PORT ||5000;

server.listen(port, () => {
  console.log(`server is running on port ${port}`);
});
