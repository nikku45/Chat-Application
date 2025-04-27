import React, { useState, useEffect, useRef, useMemo } from "react";
import socket from "../utils/socket"; // Import the singleton instance
import Imageviewer from "./Imageviewer"; // Import the ImageViewer component

export default function ChatRoom({ selectedUser, setSelectedUser }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [file, setFile] = useState(null);
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

  const saveMessageToDatabase = async (roomId, msg, sender, fileurl) => {
    try {
      const response = await fetch(`http://localhost:5000/api/message/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ roomId, msg, userId: sender, fileurl }),
      });
      const result = await response.json();
      console.log("Message saved:", result);
    } catch (error) {
      console.error("Error saving message to database:", error);
    }
  };

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
          fileurl: msg.fileurl?msg.fileurl:null,
        }));
        setMessages(formattedMessages);
      } catch (err) {
        console.error("Error fetching messages:", err);
      }
    };

    fetchMessages();
    socket.emit("joinRoom", roomId);

    const handleReceiveMessage = (data) => {
      if (data.sender && data.sender !== myId) {
        setMessages((prevMessages) => [
          ...prevMessages,
          { text: data.message, sender: data.sender, fileurl: data.fileurl || null },
        ]);
        saveMessageToDatabase(roomId, data.message, data.sender, data.fileurl);
      }
    };

    socket.on("receiveMessage", handleReceiveMessage);

    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
    };
  }, [roomId]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    let fileurl = null;

    if (file) {
      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await fetch("http://localhost:5000/api/filesharing/upload", {
          method: "POST",
          body: formData,
        });
        if (!response.ok) {
          throw new Error("File upload failed");
        }
        const data = await response.json();
        fileurl = data.fileUrl;
        console.log("File uploaded successfully:", fileurl);
      
      } catch (error) {
        console.error("Error uploading file:", error);
      }
    }

    if (input.trim() === "" && !file) return;

    socket.emit("sendMessage", { roomId, message: input, sender: myId, fileurl: fileurl });
    setMessages((prevMessages) => [
      ...prevMessages,
      { text: input, sender: myId, fileurl: fileurl },
    ]);
    saveMessageToDatabase(roomId, input, myId, fileurl);
    setInput("");
    setFile(null);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
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
              {message.text || message.fileurl ? (
                <>
                  <div className="text-sm text-gray-500 mb-1">
                   
                  {message.text && <p>{message.text}</p>}
                  </div>
                  
                  {message.fileurl && (
                   <Imageviewer imageUrl={message.fileurl} />
                  )}
                  <div className="text-sm text-gray-500 mb-1">
                    {new Date().toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </>
              ) : (
                "Message content unavailable"
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Section */}
      <div className="absolute bottom-0 left-0 right-0 bg-white text-gray-700 border-t border-gray-200 p-4">
        <form onSubmit={handleSendMessage} className="flex items-center w-full">
        <textarea
            placeholder="Type a message..."
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={1}
            style={{ maxHeight: "120px" }}
          />
        <input
            type="file"
            onChange={handleFileChange}
            className=""
            style={{ width: "100px", marginLeft: "10px" }} 
            
            accept="image/*"
          />
         
        
          <button
            type="submit"
            className="ml-3 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
            disabled={input.trim() === "" && !file}
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
        </form>
      </div>
    </div>
  );
}
