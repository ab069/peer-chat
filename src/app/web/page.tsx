"use client";
import React, { useState, useRef } from 'react';
//import '../../global.css';

const App: React.FC = () => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [callId, setCallId] = useState<string>('');
  const [isCalling, setIsCalling] = useState<boolean>(false);
  const [isAnswering, setIsAnswering] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  const pcRef = useRef<RTCPeerConnection | null>(null);

  const servers = {
    iceServers: [
      {
        urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
      },
    ],
    iceCandidatePoolSize: 10,
  };

  // Initialize the peer connection
  const initializePeerConnection = () => {
    const pc = new RTCPeerConnection(servers);
    pcRef.current = pc;

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('ICE Candidate:', event.candidate);
      }
    };

    pc.ontrack = (event) => {
      const remoteStream = new MediaStream();
      event.streams[0].getTracks().forEach((track) => {
        remoteStream.addTrack(track);
      });
      setRemoteStream(remoteStream);
    };
  };

  // Setup webcam
  const handleWebcam = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    setLocalStream(stream);
    initializePeerConnection();

    stream.getTracks().forEach((track) => {
      pcRef.current?.addTrack(track, stream);
    });
  };

  // Create offer
  const createOffer = async () => {
    if (!pcRef.current) return;

    const offer = await pcRef.current.createOffer();
    await pcRef.current.setLocalDescription(offer);

    // Simulate sending the offer to the remote peer
    const offerMessage = {
      sdp: offer.sdp,
      type: offer.type,
      callId,
    };

    console.log('Offer:', offerMessage);

    // Simulate signaling process
    simulateSignaling(offerMessage);
    setIsCalling(false);
    setIsConnected(true);
  };

  // Answer the call
  const answerCall = async () => {
    if (!pcRef.current) return;

    const offer = await simulateReceiveOffer(callId);
    await pcRef.current.setRemoteDescription(new RTCSessionDescription(offer));

    const answer = await pcRef.current.createAnswer();
    await pcRef.current.setLocalDescription(answer);

    const answerMessage = {
      sdp: answer.sdp,
      type: answer.type,
      callId,
    };

    console.log('Answer:', answerMessage);

    // Simulate signaling process
    simulateSignaling(answerMessage);
    setIsAnswering(false);
    setIsConnected(true);
  };

  // Simulate signaling process (sending and receiving messages)
  const simulateSignaling = (message: any) => {
    console.log('Simulated signaling message:', message);
    // In a real app, this would be sent to the remote peer via WebSocket or HTTP
  };

  // Simulate receiving an offer
  const simulateReceiveOffer = (callId: string) => {
    console.log('Simulating receiving offer for callId:', callId);
    return {
      sdp: 'v=0\r\no=- 4613732757027396700 2 IN IP4 127.0.0.1\r\ns=-\r\nc=IN IP4 127.0.0.1\r\nt=0 0\r\na=group:BUNDLE audio video\r\na=msid-semantic: WMS *\r\nm=audio 9 UDP/TLS/RTP/SAVPF 111 103 104 9 0 8 101\r\nc=IN IP4 0.0.0.0\r\na=rtcp:9 IN IP4 0.0.0.0\r\na=ice-ufrag:q1w2e3\r\na=ice-pwd:4r5t6y7\r\na=ice-options:trickle\r\n',
      type: 'offer',
    };
  };

  // Handle hangup
  const hangUp = () => {
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    setLocalStream(null);
    setRemoteStream(null);
    setIsConnected(false);
    setCallId('');
  };

  return (
    <div>
      <h1>WebRTC Offer and Answer</h1>
      <div>
        <button onClick={handleWebcam} disabled={localStream !== null}>
          Enable Webcam
        </button>
        <video
          id="webcamVideo"
          autoPlay
          playsInline
          style={{ width: '300px', height: 'auto' }}
          ref={(video) => {
            if (video && localStream) video.srcObject = localStream;
          }}
        ></video>
        <video
          id="remoteVideo"
          autoPlay
          playsInline
          style={{ width: '300px', height: 'auto' }}
          ref={(video) => {
            if (video && remoteStream) video.srcObject = remoteStream;
          }}
        ></video>
      </div>

      <div>
        <input
          type="text"
          placeholder="Enter Call ID"
          value={callId}
          onChange={(e) => setCallId(e.target.value)}
          disabled={isCalling || isAnswering || isConnected}
        />
        <button onClick={createOffer} disabled={isCalling || isAnswering || isConnected || !callId}>
          Make Call
        </button>
        <button onClick={answerCall} disabled={isCalling || isAnswering || isConnected || !callId}>
          Answer Call
        </button>
        <button onClick={hangUp} disabled={!isConnected}>
          Hang Up
        </button>
      </div>
    </div>
  );
};

export default App;
