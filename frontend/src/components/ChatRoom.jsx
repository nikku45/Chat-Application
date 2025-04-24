import React, { useState, useEffect, useRef, useMemo } from "react";
import socket from "../utils/socket"; // Import the singleton instance

export default function ChatRoom({ selectedUser, setSelectedUser }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  const userId = selectedUser?._id;
  const username = selectedUser?.username || "Unknown User";

  const myId = useMemo(() => localStorage.getItem("userId"), []);
  const roomId = useMemo(() => [myId, userId].sort().join("_"), [myId, userId]);

  // Scroll to the bottom when messages update
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  // Function to save messages to the database
  const saveMessageToDatabase = async (roomId, msg, sender) => {
    try {
      const response = await fetch(`http://localhost:5000/api/message/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ roomId, msg, userId: sender }),
      });
      const result = await response.json();
      console.log("Message saved:", result);
    } catch (error) {
      console.error("Error saving message to database:", error);
    }
  };

  // Fetch existing messages and setup socket listeners
  useEffect(() => {
    if (!roomId) {
      console.error("Room ID is undefined or invalid");
      return;
    }

    const fetchMessages = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/message/${roomId}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        const data = await res.json();
        
        const formattedMessages = (data || []).map((msg) => ({
          text: msg.message,
          sender: msg.sender,
          timestamp: msg.timestamp, // If needed for sorting or display
        }));
  
        setMessages(formattedMessages);
       
      } catch (err) {
        console.error("Error fetching messages:", err);
      }
    };

    fetchMessages();
    socket.emit("joinRoom", roomId);
    console.log(`Joined room: ${roomId}`);

    const handleReceiveMessage = (data) => {
      if (data.sender && data.sender !== myId) {
        setMessages((prevMessages) => [
          ...prevMessages,
          { text: data.message, sender: data.sender },
        ]);
        saveMessageToDatabase(roomId, data.message, data.sender);
      }
    };

    socket.on("receiveMessage", handleReceiveMessage);

    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
    };
  }, [roomId]);

  const handleSendMessage = () => {
    if (input.trim() === "") return;

    socket.emit("sendMessage", { roomId, message: input, sender: myId });
    setMessages((prevMessages) => [
      ...prevMessages,
      { text: input, sender: myId },
    ]);
    saveMessageToDatabase(roomId, input, myId); // Save the message to the database
    setInput(""); // Clear input field
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full relative">
      {/* Header */}
      <div className="bg-blue-600 text-white px-4 py-3 flex justify-between items-center">
        <button
          className="text-white hover:text-blue-200 transition-colors focus:outline-none flex items-center"
          onClick={() => setSelectedUser(null)}
        >
          <svg
            className="w-5 h-5 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back
        </button>
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-blue-400 flex items-center justify-center text-white mr-2">
            {username.charAt(0).toUpperCase()}
          </div>
          <h1 className="font-semibold">{username}</h1>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-100 pb-20">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.sender === myId ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-xs px-4 py-2 rounded-lg shadow ${
                message.sender === myId
                  ? "bg-blue-500 text-white"
                  : "bg-white text-gray-800"
              }`}
            >
              {message.text || message}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Section */}
      <div className="absolute bottom-0 left-0 right-0 bg-white text-gray-700 border-t border-gray-200 p-4">
        <div className="flex items-center">
          <textarea
            placeholder="Type a message..."
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            rows={1}
            style={{ maxHeight: "120px" }}
          />
          <button
            className="ml-3 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
            onClick={handleSendMessage}
            disabled={input.trim() === ""}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
