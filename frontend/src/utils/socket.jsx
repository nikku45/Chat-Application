import { io } from "socket.io-client";

const socket = io("http://localhost:5000", {
    transports: ["websocket", "polling"], // Try both websocket and polling for better compatibility
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    autoConnect: false // Don't connect immediately, let components control this
});

// Add some debugging listeners
socket.on("connect", () => {
    console.log("Socket connected successfully");
});

socket.on("connect_error", (error) => {
    console.error("Socket connection error:", error);
});

socket.on("disconnect", (reason) => {
    console.log("Socket disconnected:", reason);
});

export default socket;