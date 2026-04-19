import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import { jwtDecode } from "jwt-decode";

const Chat = () => {
  const [socket, setSocket] = useState(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [users, setUsers] = useState([]);
  const [receiverId, setReceiverId] = useState(null);
  const receiverRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const bottomRef = useRef(null);
  const token = localStorage.getItem("token");
  const decoded = jwtDecode(token);
  const userId = decoded.id;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    receiverRef.current = receiverId;
  }, [receiverId]);

  // 🔥 Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      const res = await fetch("http://localhost:3000/api/users");
      const data = await res.json();
      setUsers(data);
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    if (!receiverId) return;
    setMessages([]);
    const fetchMessages = async () => {
      const res = await fetch(
        `http://localhost:3000/api/messages/${receiverId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await res.json();
      console.log("Fetched messages:", data); // 🔍 ADD THIS
      setMessages(data.data);
    };

    fetchMessages();
  }, [receiverId, token]);

  // 🔥 Socket setup
  useEffect(() => {
    const newSocket = io("http://localhost:3000");

    newSocket.emit("join", userId);

    newSocket.on("receiveMessage", (data) => {
      const currentReceiver = receiverRef.current;

      if (
        (data.sender === currentReceiver && data.receiver === userId) ||
        (data.sender === userId && data.receiver === currentReceiver)
      ) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === data._id)) return prev;
          return [...prev, data];
        });
      }
    });
    newSocket.on("typing", ({ senderId }) => {
      if (senderId === receiverRef.current) {
        setIsTyping(true);
      }
    });
    newSocket.on("stopTyping", ({ senderId }) => {
      if (senderId === receiverRef.current) {
        setIsTyping(false);
      }
    });

    setSocket(newSocket);

    return () => newSocket.disconnect();
  }, [userId]); // ✅ only userId

  // 🔥 Send message
  const sendMessage = async () => {
    if (!message || !receiverId) {
      alert("Select a user first");
      return;
    }

    const res = await fetch("http://localhost:3000/api/messages/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        receiver: receiverId,
        content: message,
      }),
    });

    const savedMessage = await res.json();

    // ✅ update own UI
    setMessages((prev) => [...prev, savedMessage.data]);

    setMessage("");
  };

  return (
    <div style={{ padding: "20px", display: "flex", gap: "20px" }}>
      {/* 🔥 Users list */}
      <div style={{ width: "200px" }}>
        <h3>Users</h3>
        {users
          .filter((u) => u._id !== userId) // hide self
          .map((u) => (
            <div
              key={u._id}
              onClick={() => setReceiverId(u._id)}
              style={{
                padding: "8px",
                cursor: "pointer",
                background: receiverId === u._id ? "#444" : "transparent",
              }}
            >
              {u.name}
            </div>
          ))}
      </div>

      {/* 🔥 Chat area */}
      <div style={{ flex: 1 }}>
        <h2>Chat</h2>

        {/* Messages */}
        <div style={{ marginBottom: "20px" }}>
          {messages.map((msg, index) => {
            const isMe = msg.sender === userId;

            return (
              <div
                key={index}
                style={{
                  display: "flex",
                  justifyContent: isMe ? "flex-end" : "flex-start",
                  marginBottom: "8px",
                }}
              >
                <div
                  style={{
                    background: isMe ? "#4CAF50" : "#333",
                    color: "white",
                    padding: "8px 12px",
                    borderRadius: "12px",
                    maxWidth: "60%",
                  }}
                >
                  {msg.content}
                </div>
              </div>
            );
          })}
          {isTyping && (
            <div style={{ fontStyle: "italic", marginBottom: "10px" }}>
              {isTyping && (
                <div style={{ fontStyle: "italic", marginBottom: "10px" }}>
                  {users.find((u) => u._id === receiverId)?.name} is typing...
                </div>
              )}
            </div>
          )}
          <div ref={bottomRef}></div>
        </div>

        {/* Input */}
        <input
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);

            if (!socket || !receiverId) return;

            socket.emit("typing", {
              senderId: userId,
              receiverId,
            });

            if (typingTimeoutRef.current) {
              clearTimeout(typingTimeoutRef.current);
            }

            typingTimeoutRef.current = setTimeout(() => {
              socket.emit("stopTyping", {
                senderId: userId,
                receiverId,
              });
            }, 1000);
          }}
          placeholder="Type message"
        />

        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default Chat;
