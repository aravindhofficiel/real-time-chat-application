require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const Message = require("./models/Message");
const messageRoutes = require("./routes/messageRoutes");
const userRoutes = require("./routes/userRoutes");
const onlineUsers = new Map();


connectDB();

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/messages", messageRoutes);

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

const server = http.createServer(app);



const io = new Server(server, {
  cors: { origin: "*" }
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("joinRoom", (userId) => {
    socket.join(userId);

    onlineUsers.set(userId, socket.id);

    io.emit("updateOnlineUsers", Array.from(onlineUsers.keys()));
  });

  socket.on("sendMessage", async (data) => {
    const message = await Message.create({
      sender: data.sender,
      receiver: data.receiver,
      text: data.text,
    });

    io.to(data.receiver).emit("receiveMessage", message);
    io.to(data.sender).emit("receiveMessage", message);
  });

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
server.listen(process.env.PORT, () =>
  console.log("Server running on port " + process.env.PORT)
);