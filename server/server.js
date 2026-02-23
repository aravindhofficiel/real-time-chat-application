require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const messageRoutes = require("./routes/messageRoutes");
const Message = require("./models/Message");

/* =========================
   CONNECT DATABASE
========================= */

connectDB();

const app = express();

/* =========================
   GLOBAL CORS FIX
   (Allows Vercel + Localhost)
========================= */

app.use(
  cors({
    origin: true, // allow all origins (safe for your app)
    credentials: true
  })
);

app.use(express.json());

/* =========================
   ROUTES
========================= */

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/messages", messageRoutes);

/* =========================
   CREATE SERVER
========================= */

const server = http.createServer(app);

/* =========================
   SOCKET.IO SETUP
========================= */

const io = new Server(server, {
  cors: {
    origin: true,
    methods: ["GET", "POST"],
    credentials: true
  }
});

/* =========================
   ONLINE USERS MAP
========================= */

const onlineUsers = new Map();

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  /* JOIN PRIVATE ROOM */
  socket.on("joinRoom", (userId) => {
    socket.join(userId);

    onlineUsers.set(userId, socket.id);

    io.emit("updateOnlineUsers", Array.from(onlineUsers.keys()));
  });

  /* SEND MESSAGE */
  socket.on("sendMessage", async (data) => {
    try {
      const message = await Message.create({
        sender: data.sender,
        receiver: data.receiver,
        text: data.text
      });

      // Send to receiver
      io.to(data.receiver).emit("receiveMessage", message);

      // Send back to sender
      io.to(data.sender).emit("receiveMessage", message);

    } catch (error) {
      console.error("Message error:", error);
    }
  });

  /* DISCONNECT */
  socket.on("disconnect", () => {
    for (let [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        break;
      }
    }

    io.emit("updateOnlineUsers", Array.from(onlineUsers.keys()));
    console.log("User disconnected");
  });
});

/* =========================
   START SERVER
========================= */

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});