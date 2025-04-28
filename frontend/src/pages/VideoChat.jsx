import React, { useEffect, useRef, useState } from "react";
import socket from "../utils/socket"; // Ensure this points to your socket.io client setup
import { useParams } from "react-router-dom";

const VideoCall = () => {
  const [remoteSocketId, setRemoteSocketId] = useState(null);
  const [offer, setOffer] = useState(null);
  const [connected, setConnected] = useState(false);
  const localVideoRef = useRef();
  const remoteVideoRef = useRef();
  const peerConnection = useRef();
  const roomId = useParams().roomId; // Assuming you pass `roomId` via React Router
  
  const configuration = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
      { urls: "stun:stun2.l.google.com:19302" }
    ],
  };

  useEffect(() => {
    // Check and log connection status
    const checkConnection = () => {
      console.log("Socket connected:", socket.connected);
      setConnected(socket.connected);
      
      // Join room if connected
      if (socket.connected) {
        console.log("Joining room:", roomId);
        socket.emit("joinRoom",  roomId );
      }
    };

    // Connect to the socket server if not connected
    if (!socket.connected) {
      socket.connect();
    }
    
    // Set up connection event
    socket.on("connect", () => {
      console.log("Connected to server with ID:", socket.id);
      setConnected(true);
      socket.emit("joinRoom",  roomId );
    });
    
    // Check initial connection state
    checkConnection();

    // Handle a new user joining the room
    socket.on("user-joined", ({ userId }) => {
      console.log(`User ${userId} joined the room`);
      setRemoteSocketId(userId);
    });

    // Handle an incoming call
    socket.on("incoming-call", ({ from, offer }) => {
      console.log("Incoming call from:", from);
      setRemoteSocketId(from);
      setOffer(offer);
    });

    // Handle the call being answered
    socket.on("call-answered", ({ answer }) => {
      console.log("Call answered by remote user");
      if (peerConnection.current && peerConnection.current.signalingState !== "closed") {
        peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer))
          .catch(err => console.error("Error setting remote description:", err));
      }
    });

    // Handle ICE candidates
    socket.on("ice-candidate", ({ from, candidate }) => {
      console.log("Received ICE candidate from:", from);
      if (peerConnection.current && peerConnection.current.signalingState !== "closed") {
        peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate))
          .catch(err => console.error("Error adding ICE candidate:", err));
      } else {
        console.warn("Received ICE candidate but peer connection is not ready");
      }
    });

    // Handle disconnection
    return () => {
      console.log("Cleaning up...");
      if (peerConnection.current) {
        peerConnection.current.close();
      }
      
      // Remove all listeners to prevent memory leaks
      socket.off("connect");
      socket.off("user-joined");
      socket.off("incoming-call");
      socket.off("call-answered");
      socket.off("ice-candidate");
    };
  }, [roomId]);

  const startCall = async () => {
    try {
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
          console.log("Generated ICE candidate for remote peer");
          socket.emit("relay-ice-candidate", {
            to: remoteSocketId,
            candidate: event.candidate
          });
        }
      };
    
      // Monitor connection state
      peerConnection.current.onconnectionstatechange = () => {
        console.log("Connection state:", peerConnection.current.connectionState);
        if (peerConnection.current.connectionState === 'failed') {
          console.log("Connection failed - consider restarting the call");
        }
      };

      // Monitor ICE connection state
      peerConnection.current.oniceconnectionstatechange = () => {
        console.log("ICE connection state:", peerConnection.current.iceConnectionState);
      };
    
      // Get local media stream
      console.log("Getting local media stream...");
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      console.log("Local media stream acquired");
      localVideoRef.current.srcObject = stream;
    
      // Add tracks to the peer connection
      stream.getTracks().forEach((track) => {
        console.log(`Adding ${track.kind} track to peer connection`);
        peerConnection.current.addTrack(track, stream);
      });
    
      // Create and send an offer
      console.log("Creating offer...");
      const offer = await peerConnection.current.createOffer();
      console.log("Setting local description...");
      await peerConnection.current.setLocalDescription(offer);
    
      console.log("Sending call to:", remoteSocketId);
      socket.emit("call-user", { to: remoteSocketId, offer });
    } catch (error) {
      console.error("Error in startCall:", error);
    }
  };

  const answerCall = async () => {
    if (offer) {
      try {
        // Close any existing connection
        if (peerConnection.current) {
          peerConnection.current.close();
        }
        
        peerConnection.current = new RTCPeerConnection(configuration);
        console.log("PeerConnection created successfully");

        // Set up ontrack handler FIRST
        peerConnection.current.ontrack = (event) => {
          console.log("Received remote track in answerCall", event.streams);
          if (event.streams && event.streams[0]) {
            console.log("Setting remote video stream in answerCall");
            remoteVideoRef.current.srcObject = event.streams[0];
          }
        };
  
        // Add ICE candidate handling
        peerConnection.current.onicecandidate = (event) => {
          if (event.candidate) {
            console.log("Generated ICE candidate for remote peer");
            socket.emit("relay-ice-candidate", {
              to: remoteSocketId,
              candidate: event.candidate
            });
          }
        };
  
        // Monitor connection state changes
        peerConnection.current.onconnectionstatechange = () => {
          console.log("Connection state:", peerConnection.current.connectionState);
          if (peerConnection.current.connectionState === 'failed') {
            console.log("Connection failed - consider restarting the call");
          }
        };

        // Monitor ICE connection state
        peerConnection.current.oniceconnectionstatechange = () => {
          console.log("ICE connection state:", peerConnection.current.iceConnectionState);
        };
  
        // Monitor signaling state changes
        peerConnection.current.onsignalingstatechange = () => {
          console.log("Signaling state changed:", peerConnection.current.signalingState);
        };
  
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        console.log("Got local media stream");
        localVideoRef.current.srcObject = stream;
  
        stream.getTracks().forEach((track) => {
          console.log(`Adding ${track.kind} track to peer connection`);
          peerConnection.current.addTrack(track, stream);
        });
        console.log("Added local tracks to peer connection");
  
        console.log("Current signaling state:", peerConnection.current.signalingState);
        console.log("Setting remote description with offer");
        
        try {
          await peerConnection.current.setRemoteDescription(new RTCSessionDescription(offer));
          console.log("Remote description set successfully");
        } catch (error) {
          console.error("Failed to set remote description:", error);
          return;
        }
  
        console.log("Creating answer...");
        const answer = await peerConnection.current.createAnswer();
        console.log("Setting local description...");
        await peerConnection.current.setLocalDescription(answer);
        console.log("Local description set successfully");
  
        console.log("Sending answer to:", remoteSocketId);
        socket.emit("answer-call", { to: remoteSocketId, answer });
      } catch (error) {
        console.error("Error in answerCall:", error);
      }
    } else {
      console.error("No offer available to answer the call.");
    }
  };
  
  return (
    <div className="video-call-container">
      <h2>Room ID: {roomId}</h2>
      <div className="connection-status">
        Socket Status: {connected ? "Connected" : "Disconnected"}
        {remoteSocketId && <p>Remote User ID: {remoteSocketId}</p>}
      </div>
      <div className="video-grid">
        <div className="video-box">
          <h3>Your Video</h3>
          <video 
            ref={localVideoRef} 
            autoPlay 
            playsInline 
            muted 
            style={{ width: "300px", border: "1px solid #ccc" }} 
          />
        </div>
        <div className="video-box">
          <h3>Remote Video</h3>
          <video 
            ref={remoteVideoRef} 
            autoPlay 
            playsInline 
            style={{ width: "300px", border: "1px solid #ccc" }} 
          />
        </div>
      </div>
      <div className="call-controls">
        <button 
          onClick={startCall} 
          disabled={!remoteSocketId || !connected}
          className="call-button"
        >
          Start Call
        </button>
        <button 
          onClick={answerCall} 
          disabled={!offer || !connected}
          className="answer-button"
        >
          Answer Call
        </button>
      </div>
    </div>
  );
};

export default VideoCall;