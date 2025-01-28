import { useState, useRef, useEffect } from "react";

export default function useWebRTC() {
  const [localStreams, setLocalStreams] = useState<MediaStream[]>([]);
  const [remoteStreams, setRemoteStreams] = useState<MediaStream[]>([]);
  const [encodedOffer, setEncodedOffer] = useState<string | null>(null);
  const [encodedAnswer, setEncodedAnswer] = useState<string | null>(null);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);

  // Base64 encode and decode for offer/answer exchange
  const base64Encode = (data: string) => btoa(data);
  const base64Decode = (data: string) => atob(data);

  // Start the call
  const startCall = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    setLocalStreams((prevStreams) => [...prevStreams, stream]); // Add new stream to localStreams array
  
    peerConnection.current = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });
  
    // Add local stream tracks to the peer connection
    stream.getTracks().forEach((track) => peerConnection.current?.addTrack(track, stream));
  
    // Handle ICE candidates
    peerConnection.current.onicecandidate = (event) => {
      if (event.candidate) {
        console.log("ICE candidate:", event.candidate);
        // Send ICE candidate to the remote peer
      }
    };
  
    // Handle remote stream
    peerConnection.current.ontrack = (event) => {
      console.log("Received remote stream:", event.streams[0]);
      setRemoteStreams((prevStreams) => [...prevStreams, event.streams[0]]); // Add new remote stream
    };
  };

  // Toggle camera (on/off)
  const toggleCamera = () => {
    localStreams.forEach((stream) => {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsCameraOn(videoTrack.enabled);
      }
    });
  };

  // Toggle microphone (on/off)
  const toggleMic = () => {
    localStreams.forEach((stream) => {
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMicOn(audioTrack.enabled);
      }
    });
  };

  // Start/stop screen sharing
  const toggleScreenSharing = async () => {
    if (isScreenSharing) {
      // Stop screen sharing and revert to camera
      const tracks = screenStreamRef.current?.getTracks();
      tracks?.forEach((track) => track.stop());

      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStreams((prevStreams) => [...prevStreams, stream]); // Add new stream to localStreams
      setIsScreenSharing(false);

      const sender = peerConnection.current?.getSenders().find((s) => s.track?.kind === "video");
      sender?.replaceTrack(stream.getVideoTracks()[0]);
    } else {
      // Start screen sharing
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        screenStreamRef.current = screenStream;
        setLocalStreams((prevStreams) => [...prevStreams, screenStream]); // Add screen sharing stream
        setIsScreenSharing(true);

        const sender = peerConnection.current?.getSenders().find((s) => s.track?.kind === "video");
        sender?.replaceTrack(screenStream.getVideoTracks()[0]);

        screenStream.getVideoTracks()[0].onended = () => {
          toggleScreenSharing(); // Stop screen sharing if user manually stops it
        };
      } catch (error) {
        console.error("Error starting screen sharing:", error);
      }
    }
  };

  // Create an offer
  const createOffer = async () => {
    if (!peerConnection.current) return;
  
    try {
      // Ensure the connection is not in the stable state before creating a new offer
      if (peerConnection.current.signalingState !== "stable") {
        await peerConnection.current.setLocalDescription(await peerConnection.current.createOffer());
      }
  
      const offer = await peerConnection.current.createOffer();
      await peerConnection.current.setLocalDescription(offer);
      setEncodedOffer(base64Encode(JSON.stringify(offer)));
  
      console.log("New Offer Created: ", offer);
    } catch (error) {
      console.error("Error creating offer: ", error);
    }
  };

  // Accept the offer from the remote peer
  const acceptOffer = async (encodedOffer: string) => {
    if (!peerConnection.current) return;
  
    // Ensure the connection is in the correct state before setting the remote description
    if (peerConnection.current.signalingState === "stable") {
      const offerDesc = new RTCSessionDescription(JSON.parse(base64Decode(encodedOffer)));
      await peerConnection.current.setRemoteDescription(offerDesc);
  
      const answer = await peerConnection.current.createAnswer();
      await peerConnection.current.setLocalDescription(answer);
      setEncodedAnswer(base64Encode(JSON.stringify(answer)));
    } else {
      console.error("PeerConnection is not in a stable state to accept offer.");
    }
  };

  // Submit the answer to the remote peer
  const submitAnswer = async (encodedAnswer: string) => {
    if (!peerConnection.current) return;
    const answerDesc = new RTCSessionDescription(JSON.parse(base64Decode(encodedAnswer)));
    await peerConnection.current.setRemoteDescription(answerDesc);
  };

  // End the call
  const endCall = () => {
    peerConnection.current?.close();
    localStreams.forEach((stream) => {
      stream.getTracks().forEach((track) => track.stop());
    });
    setLocalStreams([]); // Clear local streams
    setRemoteStreams([]); // Clear remote streams
  };

  return {
    startCall,
    createOffer,
    submitAnswer,
    acceptOffer,
    toggleCamera,
    toggleMic,
    toggleScreenSharing,
    endCall,
    localStreams,
    remoteStreams,
    encodedOffer,
    encodedAnswer,
    isCameraOn,
    isMicOn,
    isScreenSharing,
  };
}
