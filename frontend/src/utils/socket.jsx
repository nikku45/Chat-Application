// utils/socket.js
import { io } from "socket.io-client";

const socket = io("http://localhost:5000", {
    transports: ["websocket"],
    reconnection: true, // Ensures socket tries to reconnect if disconnected
});

export default socket;
