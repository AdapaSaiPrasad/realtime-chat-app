const { io } = require("socket.io-client");

console.log("Starting testSocket1...");

const socket = io("http://localhost:3000"); // ✅ no transports

socket.on("connect", () => {
  console.log("User1 Connected:", socket.id);

  socket.emit("join", "user2");

  // ✅ emit typing AFTER connection
  setTimeout(() => {
    socket.emit("typing", { senderId: "user2", receiverId: "user1" });
  }, 2000);

  // stop typing
  setTimeout(() => {
    socket.emit("stopTyping", { senderId: "user2", receiverId: "user1" });
  }, 5000);
});

socket.on("onlineUsers", (users) => {
  console.log("User2 sees online users:", users);
});

socket.on("typing", (data) => {
  console.log("User2 sees typing from:", data.senderId);
});

socket.on("stopTyping", (data) => {
  console.log("User2 sees stop typing from:", data.senderId);
});

socket.on("connect_error", (err) => {
  console.log("Connection error:", err.message);
});