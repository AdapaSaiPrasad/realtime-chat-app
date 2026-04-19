const { io } = require("socket.io-client");

console.log("Starting testSocket1...");

const socket = io("http://localhost:3000"); // ✅ no transports

socket.on("connect", () => {
  console.log("User1 Connected:", socket.id);

  socket.emit("join", "user1");

  // ✅ emit typing AFTER connection
  setTimeout(() => {
    socket.emit("typing", { senderId: "user1", receiverId: "user2" });
  }, 2000);

  // stop typing
  setTimeout(() => {
    socket.emit("stopTyping", { senderId: "user1", receiverId: "user2" });
  }, 5000);
});

socket.on("onlineUsers", (users) => {
  console.log("User1 sees online users:", users);
});

socket.on("typing", (data) => {
  const receiverSocketId = users[receiverId];

  if (receiverSocketId) {
    io.to(receiverSocketId).emit("typing", { senderId });
  }
});

socket.on("stopTyping", ({ senderId, receiverId }) => {
  const receiverSocketId = users[receiverId];

  if (receiverSocketId) {
    io.to(receiverSocketId).emit("stopTyping", { senderId });
  }
});

socket.on("stopTyping", (data) => {
  console.log("User1 sees stop typing from:", data.senderId);
});

socket.on("connect_error", (err) => {
  console.log("Connection error:", err.message);
});