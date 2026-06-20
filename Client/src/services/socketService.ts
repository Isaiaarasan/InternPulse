import { io, Socket } from "socket.io-client";
import { useAuthStore } from "../stores/authStore";
import toast from "react-hot-toast";

let socket: Socket | null = null;

export const socketService = {
  connect: () => {
    const token = useAuthStore.getState().token;
    if (!token) return;

    if (socket && socket.connected) return;

    socket = io(import.meta.env.VITE_API_URL || "http://localhost:5000", {
      auth: {
        token,
      },
    });

    socket.on("connect", () => {
      console.log("WebSocket connected!");
    });

    socket.on("new_notification", (notification) => {
      // You can dispatch this to a notification store if needed
      // For now, let's just show a toast
      toast.success(notification.message, {
        icon: "🔔",
      });
      
      // If we have a notification store, we can update it here
      // useNotifStore.getState().addNotification(notification);
    });

    socket.on("disconnect", () => {
      console.log("WebSocket disconnected!");
    });
    
    socket.on("connect_error", (err) => {
      console.error("Socket connection error:", err.message);
    });
  },

  disconnect: () => {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
  },

  getSocket: () => socket,
};
