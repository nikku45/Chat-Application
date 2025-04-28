import React, { useEffect, useRef, useState } from "react";
import socket from "../utils/socket";
import { useParams, useNavigate } from "react-router-dom";

const VideoCall = () => {
  const [remoteSocketId, setRemoteSocketId] = useState(null);
  const [offer, setOffer] = useState(null);
  const [connected, setConnected] = useState(false);
  const [callStatus, setCallStatus] = useState("idle"); // idle, calling, inCall, receiving
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [localStream, setLocalStream] = useState(null);
  const [showNotification, setShowNotification] = useState(false);
  const [callerName, setCallerName] = useState("");
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const [roomInfo, setRoomInfo] = useState({ participantCount: 0 });
  
  const localVideoRef = useRef();
  const remoteVideoRef = useRef();
  const peerConnection = useRef();
  const screenStream = useRef();
  const originalStream = useRef();
  const roomId = useParams().roomId;
  const navigate = useNavigate();
  
  const configuration = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
      { urls: "stun:stun2.l.google.com:19302" }
    ],
  };

  useEffect(() => {
    // Initialize local media on component mount
    const initLocalMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localVideoRef.current.srcObject = stream;
        setLocalStream(stream);
        originalStream.current = stream;
      } catch (error) {
        console.error("Error accessing media devices:", error);
        setConnectionError("Failed to access camera or microphone. Please check your permissions.");
      }
    };
    
    initLocalMedia();
    
    // Check and log connection status
    const checkConnection = () => {
      setConnected(socket.connected);
      
      if (socket.connected) {
        console.log("Joining room:", roomId);
        socket.emit("joinRoom", roomId);
      }
    };

    if (!socket.connected) {
      socket.connect();
    }
    
    socket.on("connect", () => {
      console.log("Connected to server with ID:", socket.id);
      setConnected(true);
      socket.emit("joinRoom", roomId);
    });
    
    socket.on("connect_error", (err) => {
      console.error("Connection error:", err);
      setConnected(false);
      setConnectionError("Failed to connect to the server. Please check your internet connection.");
    });
    
    checkConnection();

    // Handle a new user joining the room
    socket.on("user-joined", ({ userId }) => {
      console.log(`User ${userId} joined the room`);
      setRemoteSocketId(userId);
    });

    // Handle room information updates
    socket.on("room-info", (info) => {
      console.log("Room info received:", info);
      setRoomInfo(info);
    });

    // Handle an incoming call
    socket.on("incoming-call", ({ from, offer, name = "Someone" }) => {
      console.log("Incoming call from:", from);
      setRemoteSocketId(from);
      setOffer(offer);
      setCallerName(name);
      setCallStatus("receiving");
      setShowNotification(true);
      
      // Play ringtone
      const audio = new Audio("/sounds/ringtone.mp3");
      audio.loop = true;
      audio.play().catch(e => console.log("Audio play failed:", e));
      
      // Store audio element reference to stop it later
      window.incomingCallAudio = audio;
    });

    // Handle the call being answered
    socket.on("call-answered", ({ answer }) => {
      console.log("Call answered by remote user");
      setCallStatus("inCall");
      
      // Stop outgoing call ringtone if playing
      if (window.outgoingCallAudio) {
        window.outgoingCallAudio.pause();
        window.outgoingCallAudio = null;
      }
      
      if (peerConnection.current && peerConnection.current.signalingState !== "closed") {
        peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer))
          .catch(err => console.error("Error setting remote description:", err));
      }
    });
    
    // Handle call rejected
    socket.on("call-rejected", () => {
      console.log("Call was rejected");
      setCallStatus("idle");
      
      // Stop outgoing call ringtone if playing
      if (window.outgoingCallAudio) {
        window.outgoingCallAudio.pause();
        window.outgoingCallAudio = null;
      }
      
      resetCall();
      showToast("Call rejected");
    });

    // Handle ICE candidates
    socket.on("ice-candidate", ({ from, candidate }) => {
      console.log("Received ICE candidate from:", from);
      if (peerConnection.current && peerConnection.current.signalingState !== "closed") {
        peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate))
          .catch(err => console.error("Error adding ICE candidate:", err));
      }
    });
    
    // Handle remote user ending call
    socket.on("call-ended", () => {
      console.log("Remote user ended the call");
      showToast("Call ended by remote user");
      endCall();
    });

    // Handle user leaving the room
    socket.on("user-left", ({ userId }) => {
      console.log(`User ${userId} left the room`);
      if (userId === remoteSocketId) {
        showToast("Remote user disconnected");
        endCall();
      }
    });

    // Handle disconnection
    return () => {
      console.log("Cleaning up...");
      if (peerConnection.current) {
        peerConnection.current.close();
      }
      
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      
      if (screenStream.current) {
        screenStream.current.getTracks().forEach(track => track.stop());
      }
      
      // Stop ringtone if playing
      if (window.incomingCallAudio) {
        window.incomingCallAudio.pause();
        window.incomingCallAudio = null;
      }
      
      if (window.outgoingCallAudio) {
        window.outgoingCallAudio.pause();
        window.outgoingCallAudio = null;
      }
      
      // Notify server we're leaving
      socket.emit("leaveRoom", { roomId });
      
      // Remove all listeners
      socket.off("connect");
      socket.off("connect_error");
      socket.off("user-joined");
      socket.off("room-info");
      socket.off("incoming-call");
      socket.off("call-answered");
      socket.off("call-rejected");
      socket.off("ice-candidate");
      socket.off("call-ended");
      socket.off("user-left");
    };
  }, [roomId, navigate]);

  const startCall = async () => {
    try {
      setCallStatus("calling");
      
      // Close any existing connection
      if (peerConnection.current) {
        peerConnection.current.close();
      }
      
      peerConnection.current = new RTCPeerConnection(configuration);
      console.log("PeerConnection created for call");
    
      // Set up ontrack handler BEFORE creating offer
      peerConnection.current.ontrack = (event) => {
        console.log("Received remote track in startCall", event.streams);
        if (event.streams && event.streams[0]) {
          console.log("Setting remote video stream");
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      };
    
      // Add ICE candidate handling
      peerConnection.current.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("relay-ice-candidate", {
            to: remoteSocketId,
            candidate: event.candidate
          });
        }
      };
    
      // Monitor connection state
      peerConnection.current.onconnectionstatechange = () => {
        console.log("Connection state:", peerConnection.current.connectionState);
        if (peerConnection.current.connectionState === 'disconnected' || 
            peerConnection.current.connectionState === 'failed') {
          showToast("Connection lost");
          endCall();
        }
      };

      // Monitor ICE connection state
      peerConnection.current.oniceconnectionstatechange = () => {
        console.log("ICE connection state:", peerConnection.current.iceConnectionState);
        if (peerConnection.current.iceConnectionState === 'failed') {
          showToast("ICE connection failed. Try again or check your network");
        }
      };
    
      // Use existing local stream if available
      const stream = localStream || await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      
      if (!localStream) {
        localVideoRef.current.srcObject = stream;
        setLocalStream(stream);
        originalStream.current = stream;
      }
    
      // Add tracks to the peer connection
      stream.getTracks().forEach((track) => {
        console.log(`Adding ${track.kind} track to peer connection`);
        peerConnection.current.addTrack(track, stream);
      });
    
      // Create and send an offer
      const offer = await peerConnection.current.createOffer();
      await peerConnection.current.setLocalDescription(offer);
    
      console.log("Sending call to:", remoteSocketId);
      socket.emit("call-user", { 
        to: remoteSocketId, 
        offer,
        name: localStorage.getItem("userName") || "User" // Get name from localStorage if available
      });
      
      // Play ringtone
      const audio = new Audio("/sounds/outgoing-call.mp3");
      audio.loop = true;
      audio.play().catch(e => console.log("Audio play failed:", e));
      window.outgoingCallAudio = audio;
      
      showToast("Calling...");
    } catch (error) {
      console.error("Error in startCall:", error);
      setCallStatus("idle");
      showToast("Failed to start call");
      setConnectionError(error.message);
    }
  };
 
  const answerCall = async () => {
    if (offer) {
      try {
        // Stop ringtone
        if (window.incomingCallAudio) {
          window.incomingCallAudio.pause();
          window.incomingCallAudio = null;
        }
        
        setCallStatus("inCall");
        setShowNotification(false);
        
        // Close any existing connection
        if (peerConnection.current) {
          peerConnection.current.close();
        }
        
        peerConnection.current = new RTCPeerConnection(configuration);

        // Set up ontrack handler
        peerConnection.current.ontrack = (event) => {
          if (event.streams && event.streams[0]) {
            remoteVideoRef.current.srcObject = event.streams[0];
          }
        };
  
        // Add ICE candidate handling
        peerConnection.current.onicecandidate = (event) => {
          if (event.candidate) {
            socket.emit("relay-ice-candidate", {
              to: remoteSocketId,
              candidate: event.candidate
            });
          }
        };
  
        // Monitor connection state changes
        peerConnection.current.onconnectionstatechange = () => {
          console.log("Connection state:", peerConnection.current.connectionState);
          if (peerConnection.current.connectionState === 'disconnected' || 
              peerConnection.current.connectionState === 'failed') {
            showToast("Connection lost");
            endCall();
          }
        };

        // Use existing local stream if available
        const stream = localStream || await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        
        if (!localStream) {
          localVideoRef.current.srcObject = stream;
          setLocalStream(stream);
          originalStream.current = stream;
        }
  
        stream.getTracks().forEach((track) => {
          peerConnection.current.addTrack(track, stream);
        });
  
        await peerConnection.current.setRemoteDescription(new RTCSessionDescription(offer));
        
        const answer = await peerConnection.current.createAnswer();
        await peerConnection.current.setLocalDescription(answer);
  
        socket.emit("answer-call", { to: remoteSocketId, answer });
        showToast("Call connected");
      } catch (error) {
        console.error("Error in answerCall:", error);
        setCallStatus("idle");
        setShowNotification(false);
        showToast("Failed to answer call");
        setConnectionError(error.message);
      }
    }
  };
  
  const rejectCall = () => {
    // Stop ringtone
    if (window.incomingCallAudio) {
      window.incomingCallAudio.pause();
      window.incomingCallAudio = null;
    }
    
    setShowNotification(false);
    setCallStatus("idle");
    
    // Notify the caller that the call was rejected
    socket.emit("reject-call", { to: remoteSocketId });
    
    // Reset call state
    resetCall();
  };
  
  const endCall = () => {
    // Notify the remote peer that we're ending the call
    if (remoteSocketId && (callStatus === "inCall" || callStatus === "calling")) {
      socket.emit("end-call", { to: remoteSocketId });
    }
    
    // Stop outgoing call ringtone if playing
    if (window.outgoingCallAudio) {
      window.outgoingCallAudio.pause();
      window.outgoingCallAudio = null;
    }
    
    // If screen sharing is active, stop it and revert to camera
    if (isScreenSharing && screenStream.current) {
      stopScreenSharing();
    }
    
    resetCall();
  };
  
  const resetCall = () => {
    // Close peer connection
    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }
    
    // Clear remote video
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
    
    setOffer(null);
    setCallStatus("idle");
  };
  
  const toggleMute = () => {
    if (localStream) {
      const audioTracks = localStream.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsAudioMuted(!isAudioMuted);
    }
  };
  
  const toggleVideo = () => {
    if (localStream) {
      const videoTracks = localStream.getVideoTracks();
      videoTracks.forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsVideoOff(!isVideoOff);
    }
  };
  
  const startScreenSharing = async () => {
    try {
      // Stop screen sharing if already active
      if (isScreenSharing) {
        return stopScreenSharing();
      }
      
      // Request screen sharing access
      const stream = await navigator.mediaDevices.getDisplayMedia({ 
        video: true,
        audio: false // Most browsers don't support audio capture in screen sharing
      });
      
      // Save current camera stream to revert back later
      originalStream.current = localStream;
      screenStream.current = stream;
      
      // Update local video feed to show screen
      localVideoRef.current.srcObject = stream;
      setLocalStream(stream);
      setIsScreenSharing(true);
      
      // Replace tracks in peer connection if we're in a call
      if (peerConnection.current && callStatus === "inCall") {
        const videoTrack = stream.getVideoTracks()[0];
        
        const senders = peerConnection.current.getSenders();
        const videoSender = senders.find(sender => 
          sender.track && sender.track.kind === "video"
        );
        
        if (videoSender) {
          videoSender.replaceTrack(videoTrack);
        }
      }
      
      // Handle the case when user stops screen sharing through browser UI
      stream.getVideoTracks()[0].addEventListener('ended', () => {
        stopScreenSharing();
      });
      
      showToast("Screen sharing started");
    } catch (error) {
      console.error("Error starting screen share:", error);
      showToast("Failed to start screen sharing");
    }
  };
  
  const stopScreenSharing = () => {
    if (screenStream.current) {
      // Stop all screen sharing tracks
      screenStream.current.getTracks().forEach(track => track.stop());
      
      // Revert to camera stream
      if (originalStream.current) {
        localVideoRef.current.srcObject = originalStream.current;
        setLocalStream(originalStream.current);
        
        // Replace track in peer connection if in a call
        if (peerConnection.current && callStatus === "inCall") {
          const videoTrack = originalStream.current.getVideoTracks()[0];
          
          const senders = peerConnection.current.getSenders();
          const videoSender = senders.find(sender => 
            sender.track && sender.track.kind === "video"
          );
          
          if (videoSender && videoTrack) {
            videoSender.replaceTrack(videoTrack);
          }
        }
      }
      
      screenStream.current = null;
      setIsScreenSharing(false);
      showToast("Screen sharing stopped");
    }
  };
  
  // Handle copy room ID to clipboard
  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId)
      .then(() => showToast("Room ID copied to clipboard"))
      .catch(err => console.error("Failed to copy:", err));
  };
  
  const showToast = (message) => {
    // Create toast element
    const toast = document.createElement("div");
    toast.className = "fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-opacity duration-500";
    toast.innerText = message;
    document.body.appendChild(toast);
    
    // Remove toast after 3 seconds
    setTimeout(() => {
      toast.classList.add("opacity-0");
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 500);
    }, 3000);
  };

  // Leave room and navigate back
  const leaveRoom = () => {
    if (callStatus !== "idle") {
      endCall();
    }
    navigate("/");
  };

  return (
    <div className="max-w-6xl mx-auto p-4 font-sans">
      {/* Room Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-2xl font-bold">Room: {roomId}</h2>
          <p className="text-sm text-gray-500">
            {roomInfo.participantCount} participant{roomInfo.participantCount !== 1 ? 's' : ''} in room
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={copyRoomId}
            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm flex items-center"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
            </svg>
            Copy ID
          </button>
          <button 
            onClick={leaveRoom}
            className="px-3 py-1 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-sm flex items-center"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
            </svg>
            Leave Room
          </button>
        </div>
      </div>
      
      {/* Connection Status */}
      <div className="flex items-center mb-4 p-3 bg-gray-50 rounded-lg shadow-sm">
        <span className={`w-3 h-3 rounded-full mr-2 ${connected ? "bg-green-500" : "bg-red-500"}`}></span>
        <span>{connected ? "Connected" : "Disconnected"}</span>
        {remoteSocketId && callStatus === "idle" && (
          <div className="ml-auto px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
            User online
          </div>
        )}
      </div>
      
      {/* Error display */}
      {connectionError && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg flex items-center">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          {connectionError}
          <button 
            onClick={() => setConnectionError(null)} 
            className="ml-auto text-red-700"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      )}
      
      {/* Call Notification */}
      {showNotification && (
        <div className="fixed top-5 right-5 bg-white rounded-xl shadow-lg w-80 overflow-hidden z-50 animate-slide-in">
          <div className="flex p-4 border-b border-gray-200">
            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 mr-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div className="flex flex-col justify-center">
              <span className="font-medium text-gray-800">{callerName}</span>
              <small className="text-gray-500">Incoming call...</small>
            </div>
          </div>
          <div className="flex justify-between p-3">
            <button 
              onClick={rejectCall} 
              className="flex items-center justify-center px-4 py-2 bg-gray-100 hover:bg-red-50 text-red-500 rounded-full font-medium transition-colors"
            >
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
              Decline
            </button>
            <button 
              onClick={answerCall}
              className="flex items-center justify-center px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-full font-medium transition-colors"
            >
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
              </svg>
              Answer
            </button>
          </div>
        </div>
      )}
      
      {/* Call Status Banner */}
      {callStatus === "calling" && (
        <div className="flex items-center justify-between p-3 mb-4 bg-blue-50 rounded-lg">
          <div className="flex items-center">
            <div className="relative mr-3">
              <div className="absolute inset-0 animate-ping rounded-full bg-blue-400 opacity-75 w-8 h-8"></div>
              <div className="relative rounded-full bg-blue-500 w-8 h-8 flex items-center justify-center text-white">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                </svg>
              </div>
            </div>
            <p className="text-blue-800 font-medium">Calling...</p>
          </div>
          <button 
            onClick={endCall}
            className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center transition-colors"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
            Cancel
          </button>
        </div>
      )}
      
      {/* Video Grid */}
      <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 ${callStatus === "inCall" ? "h-96" : "h-64"}`}>
        <div className="relative bg-gray-100 rounded-lg overflow-hidden shadow-md">
          <video 
            ref={localVideoRef} 
            autoPlay 
            playsInline 
            muted 
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-2 left-2 bg-gray-800 bg-opacity-60 text-white px-2 py-1 rounded text-sm flex items-center">
            {isScreenSharing && (
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
              </svg>
            )}
            You {isScreenSharing && '(Screen)'}
          </div>
          {isVideoOff && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-700">
            <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          )}
          </div>
          
          {/* Remote Video Container */}
          <div className="relative bg-gray-100 rounded-lg overflow-hidden shadow-md">
            {callStatus === "inCall" ? (
              <>
                <video 
                  ref={remoteVideoRef} 
                  autoPlay 
                  playsInline 
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2 left-2 bg-gray-800 bg-opacity-60 text-white px-2 py-1 rounded text-sm">
                  Remote User
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center p-4">
                  <div className="bg-gray-200 rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                  {remoteSocketId ? (
                    <p>Ready to connect with remote user</p>
                  ) : (
                    <p>Waiting for someone to join...</p>
                  )}
                </div>
              </div>
            )}
          </div>
          </div>
          
          {/* Controls Section */}
          <div className="bg-white rounded-xl shadow-md p-4">
            {/* Call Action Button */}
            <div className="flex justify-center mb-4">
              {callStatus === "idle" ? (
                <button
                  onClick={startCall}
                  disabled={!remoteSocketId}
                  className={`px-6 py-3 rounded-full flex items-center ${
                    remoteSocketId 
                      ? "bg-green-500 hover:bg-green-600 text-white" 
                      : "bg-gray-200 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                  </svg>
                  Start Call
                </button>
              ) : callStatus === "inCall" ? (
                <button
                  onClick={endCall}
                  className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z"></path>
                  </svg>
                  End Call
                </button>
              ) : null}
            </div>
            </div>
         </div>   
 )
}

export default VideoCall;