import { useState, useRef, useEffect } from "react";

const useWebRTC = () => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isScreenSharing, setIsScreenSharing] = useState<boolean>(false);
  const [isMicOn, setIsMicOn] = useState<boolean>(true);
  const [isCallActive, setIsCallActive] = useState<boolean>(false);
  const [messages, setMessages] = useState<string[]>([]);
  const [encodedOffer, setEncodedOffer] = useState<string | null>(null);
  const [encodedAnswer, setEncodedAnswer] = useState<string | null>(null);

  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const dataChannel = useRef<RTCDataChannel | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);

  // ICE Servers (using default STUN server)
  const iceServers = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
    ],
  };

  // Start the call (get local stream)
  const startCall = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    setLocalStream(stream);
    setIsCallActive(true);

    peerConnection.current = new RTCPeerConnection(iceServers);

    // Create data channel for messaging
    dataChannel.current = peerConnection.current.createDataChannel("chat");
    dataChannel.current.onmessage = (event) => {
      setMessages((prev) => [...prev, `Peer: ${event.data}`]);
    };
    dataChannel.current.onopen = () => console.log("🟢 Data Channel Opened");
    dataChannel.current.onclose = () => console.log("🔴 Data Channel Closed");

    // Add local stream to the peer connection
    stream.getTracks().forEach((track) => {
      peerConnection.current?.addTrack(track, stream);
    });

    // Handle remote stream
    peerConnection.current.ontrack = (event) => {
      if (event.streams.length > 0) setRemoteStream(event.streams[0]);
    };

    // Handle ICE candidates
    peerConnection.current.onicecandidate = (event) => {
      if (event.candidate) {
        // Send ICE candidate to the remote peer (you can exchange this manually)
        console.log("🔄 ICE Candidate:", event.candidate);
      }
    };
  };

  // Create an offer
  const createOffer = async () => {
    if (!peerConnection.current) return;
    const offer = await peerConnection.current.createOffer();
    await peerConnection.current.setLocalDescription(offer);
    setEncodedOffer(JSON.stringify(offer));
  };

  // Accept the offer and create an answer
  const acceptOffer = async (encodedOffer: string) => {
    if (!peerConnection.current) return;
    const offer = JSON.parse(encodedOffer);
    await peerConnection.current.setRemoteDescription(new RTCSessionDescription(offer));

    // Create and send an answer
    const answer = await peerConnection.current.createAnswer();
    await peerConnection.current.setLocalDescription(answer);
    setEncodedAnswer(JSON.stringify(answer));
  };

  // Submit the answer to the remote peer
  const submitAnswer = async (encodedAnswer: string) => {
    if (!peerConnection.current) return;
    const answer = JSON.parse(encodedAnswer);
    await peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer));
  };

  // Send a message through the data channel
  const sendMessage = (message: string) => {
    if (dataChannel.current && dataChannel.current.readyState === "open") {
      dataChannel.current.send(message);
      setMessages((prev) => [...prev, `You: ${message}`]);
    }
  };

  // Toggle screen sharing
  const toggleScreenSharing = async () => {
    if (isScreenSharing) {
      // Stop screen sharing and resume webcam
      screenStreamRef.current?.getTracks().forEach((track) => track.stop());
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setLocalStream(stream);
      peerConnection.current?.getSenders().find((s) => s.track?.kind === "video")?.replaceTrack(stream.getVideoTracks()[0]);
      setIsScreenSharing(false);
    } else {
      // Start screen sharing
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        screenStreamRef.current = screenStream;
        setLocalStream(screenStream);
        peerConnection.current?.getSenders().find((s) => s.track?.kind === "video")?.replaceTrack(screenStream.getVideoTracks()[0]);
        screenStream.getVideoTracks()[0].onended = () => toggleScreenSharing();
        setIsScreenSharing(true);
      } catch (error) {
        console.error("❌ Error Starting Screen Sharing:", error);
      }
    }
  };

  // Toggle microphone
  const toggleMic = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMicOn(audioTrack.enabled);
      }
    }
  };

  // End the call
  const endCall = () => {
    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }
    dataChannel.current = null;
    localStream?.getTracks().forEach((track) => track.stop());
    screenStreamRef.current?.getTracks().forEach((track) => track.stop());
    setLocalStream(null);
    setRemoteStream(null);
    setIsScreenSharing(false);
    setIsCallActive(false);
  };

  return {
    startCall,
    createOffer,
    acceptOffer,
    submitAnswer,
    sendMessage,
    messages,
    toggleScreenSharing,
    toggleMic,
    endCall,
    localStream,
    remoteStream,
    encodedOffer,
    encodedAnswer,
    isScreenSharing,
    isMicOn,
    isCallActive,
  };
};

export default useWebRTC;
