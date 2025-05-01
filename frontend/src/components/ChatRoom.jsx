import React, { useState, useEffect, useRef, useMemo } from "react";
import socket from "../utils/socket"; // Import the singleton instance
import Imageviewer from "./Imageviewer"; // Import the ImageViewer component
import { startRecording, stopRecording, uploadAudio } from "../utils/RecordingFunction"; // Import the recorder functions
import { useNavigate } from "react-router-dom";

export default function ChatRoom({ selectedUser, setSelectedUser }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [file, setFile] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null); // State to store the audio blob
  const [recordingTime, setRecordingTime] = useState(0);
  const [visualizerValues, setVisualizerValues] = useState(Array(10).fill(2));
  let audioUrl = null; // Variable to store the audio URL
  
  const navigate = useNavigate();

  const messagesEndRef = useRef(null);

  const userId = selectedUser?._id;
  const username = selectedUser?.username || "Unknown User";

  const myId = useMemo(() => localStorage.getItem("userId"), []);
  const roomId = useMemo(() => [myId, userId].sort().join("_"), [myId, userId]);

  // Recording timer effect
  useEffect(() => {
    let interval;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
        // Create random amplitude data for visualization effect
        setVisualizerValues(Array(10).fill().map(() => Math.floor(Math.random() * 15) + 2));
      }, 1000);
    } else {
      clearInterval(interval);
      setRecordingTime(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  // Scroll to the bottom when messages update
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const saveMessageToDatabase = async (roomId, msg, sender, fileurl, audioUrl) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_APP_API_URL}/api/message/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ roomId, msg, userId: sender, fileurl, audioUrl }),
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
        const res = await fetch(`${import.meta.env.VITE_APP_API_URL}/api/message/${roomId}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        const data = await res.json();

        const formattedMessages = (data || []).map((msg) => ({
          text: msg.message,
          sender: msg.sender,
          fileurl: msg.fileurl ? msg.fileurl : null,
          audioUrl: msg.audioUrl ? msg.audioUrl : null,
        }));
        setMessages(formattedMessages);
      } catch (err) {
        console.error("Error fetching messages:", err);
      }
    };
     
    fetchMessages();
    socket.connect();
    console.log(roomId);
    socket.emit("joinRoom", roomId);

    const handleReceiveMessage = (data) => {
      if (data.sender && data.sender !== myId) {
        setMessages((prevMessages) => [
          ...prevMessages,
          { text: data.message, sender: data.sender, fileurl: data.fileurl || null, audioUrl: data.audioUrl || null },
        ]);
        saveMessageToDatabase(roomId, data.message, data.sender, data.fileurl, data.audioUrl);
      }
    };

    socket.on("receiveMessage", handleReceiveMessage);

    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
    };
  }, [roomId, myId]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    let fileurl = null;

    if (file) {
      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await fetch(`${import.meta.env.VITE_APP_API_URL}/api/filesharing/chat/upload`, {
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
    
    if (audioBlob) {
      audioUrl = await uploadAudio(audioBlob); // Upload the audio blob and get the URL
      console.log('Uploaded Audio URL:', audioUrl);
    }

    if (input.trim() === "" && !file && !audioBlob) return;

    socket.emit("sendMessage", { roomId, message: input, sender: myId, fileurl: fileurl, audioUrl: audioUrl });
    setMessages((prevMessages) => [
      ...prevMessages,
      { text: input, sender: myId, fileurl: fileurl, audioUrl: audioUrl },
    ]);
    saveMessageToDatabase(roomId, input, myId, fileurl, audioUrl);
    setInput("");
    setFile(null);
    setAudioBlob(null);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  const handleStartRecording = () => {
    setIsRecording(true);
    startRecording(setAudioBlob);
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    stopRecording();
  };

  return (
    <div className="flex flex-col h-full relative bg-white">
      {/* Header */}
      <div className="bg-white text-gray-800 px-4 py-3 flex justify-between items-center border-b border-gray-200 shadow-sm">
        <button
          className="text-gray-600 hover:text-gray-800 transition-colors focus:outline-none flex items-center"
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
          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white mr-3">
            {username.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="font-semibold text-gray-900">{username}</h1>
            <p className="text-xs text-green-500">Online</p>
          </div>
        </div>
        
        <button 
          onClick={() => navigate(`./videochat/${roomId}`)} 
          className="flex items-center justify-center p-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
        <div className="text-center text-xs text-gray-500 mb-4">Today</div>
        
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.sender === myId ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-xs md:max-w-md px-4 py-2 rounded-lg shadow ${
                message.sender === myId
                  ? "bg-blue-500 text-white"
                  : "bg-white text-gray-800"
              }`}
            >
              {message.text && <p className="mb-1">{message.text}</p>}
              
              {message.fileurl && (
                <div className="mt-2 mb-2 rounded overflow-hidden">
                  <Imageviewer imageUrl={message.fileurl} />
                </div>
              )}
              
              {message.audioUrl && (
                <div className="mt-2 rounded overflow-hidden bg-blue-50 p-1">
                  <audio controls className="w-full" src={`${message.audioUrl}`}>
                    Your browser does not support audio playback.
                  </audio>
                </div>
              )}
              
              <div className={`text-xs text-right mt-1 ${message.sender === myId ? 'text-blue-100' : 'text-gray-500'}`}>
                {new Date().toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Section */}
      <div className="bg-white text-gray-700 border-t border-gray-200 p-4">
        {file && (
          <div className="mb-2 px-3 py-2 bg-blue-50 rounded-md flex items-center justify-between">
            <span className="text-sm text-blue-700">Image selected: {file.name}</span>
            <button 
              onClick={() => setFile(null)}
              className="ml-2 text-red-500 hover:text-red-700"
            >
              ✕
            </button>
          </div>
        )}
        
        {audioBlob && (
          <div className="mb-2 px-3 py-2 bg-blue-50 rounded-md flex items-center justify-between">
            <span className="text-sm text-blue-700">Audio recording ready to send</span>
            <button 
              onClick={() => setAudioBlob(null)}
              className="ml-2 text-red-500 hover:text-red-700"
            >
              ✕
            </button>
          </div>
        )}
        
        <form onSubmit={handleSendMessage} className="flex items-center w-full">
          <textarea
            placeholder="Type a message..."
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={1}
            style={{ maxHeight: "120px" }}
          />
          
          <div className="flex items-center ml-2">
            <label className="flex items-center justify-center px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors focus:outline-none cursor-pointer">
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
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <input
                type="file"
                onChange={handleFileChange}
                className="hidden"
                accept="image/*"
              />
            </label>
            
            {isRecording ? (
              <div className="flex items-center ml-2">
                {/* Visualizer */}
                <div className="flex items-end space-x-1 bg-red-50 rounded-lg px-2 py-1">
                  {visualizerValues.map((value, index) => (
                    <div 
                      key={index}
                      className="bg-red-500 rounded-full w-1"
                      style={{ 
                        height: `${value}px`,
                        transition: 'height 0.2s ease'
                      }}
                    />
                  ))}
                </div>
                
                {/* Timer */}
                <span className="text-xs font-mono text-red-600 mx-2">
                  {formatTime(recordingTime)}
                </span>
                
                {/* Stop button */}
                <button
                  type="button"
                  onClick={handleStopRecording}
                  className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors focus:outline-none"
                >
                  Stop
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleStartRecording}
                className="flex items-center justify-center px-3 py-2 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200 transition-colors focus:outline-none ml-2"
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
                    d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                  />
                </svg>
              </button>
            )}
          </div>
          
          <button
            type="submit"
            className="ml-2 p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors focus:outline-none disabled:opacity-50 flex items-center justify-center"
            disabled={input.trim() === "" && !file && !audioBlob}
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