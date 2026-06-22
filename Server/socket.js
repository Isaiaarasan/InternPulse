import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import User from "./models/User.model.js";

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL ? process.env.FRONTEND_URL.replace(/\/$/, "") : "http://localhost:5173",
      credentials: true,
    },
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error("Authentication error: No token provided"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select("-password");

      if (!user) {
        return next(new Error("Authentication error: User not found"));
      }

      socket.user = user;
      socket.join(user._id.toString()); // Join a room for their specific user ID
      
      // Managers and Admins can join role-based rooms
      if (user.role === 'manager' || user.role === 'admin') {
          socket.join(user.role);
      }

      next();
    } catch (err) {
      next(new Error("Authentication error: Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.user.name} (${socket.user._id})`);

    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.user.name} (${socket.user._id})`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};

export const sendNotification = (userId, notification) => {
  if (io) {
    io.to(userId.toString()).emit("new_notification", notification);
  }
};
