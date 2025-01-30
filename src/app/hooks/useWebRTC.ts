import { useCallback, useEffect, useRef, useState } from "react";

export default function useWebRTC() {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [encodedOffer, setEncodedOffer] = useState<string | null>(null);
  const [encodedAnswer, setEncodedAnswer] = useState<string | null>(null);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMicOn, setIsMicOn] = useState(true);
  const [messages, setMessages] = useState<string[]>([]);
  const [iceCandidates, setIceCandidates] = useState<string[]>([]);
  const [isRemoteMicOn, setIsRemoteMicOn] = useState(true);

  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const dataChannel = useRef<RTCDataChannel | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);

  // Utility functions for encoding/decoding data
  const base64Encode = useCallback((data: string) => btoa(unescape(encodeURIComponent(data))), []);
  const base64Decode = useCallback((data: string) => decodeURIComponent(escape(atob(data))), []);

  // Function to start a WebRTC call
  const startCall = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStream(stream);
      setIsCallActive(true);

      peerConnection.current = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      });

      dataChannel.current = peerConnection.current.createDataChannel("chat");
      dataChannel.current.onmessage = (event) => setMessages((prev) => [...prev, `Peer: ${event.data}`]);

      stream.getTracks().forEach((track) => peerConnection.current?.addTrack(track, stream));

      peerConnection.current.ontrack = (event) => {
        if (event.streams.length > 0) setRemoteStream(event.streams[0]);
      };

      peerConnection.current.onicecandidate = (event) => {
        if (event.candidate) {
          setIceCandidates((prev) => [...prev, base64Encode(JSON.stringify(event.candidate))]);
        }
      };
    } catch (error) {
      console.error("❌ Error Starting Call:", error);
    }
  }, [base64Encode]);

  // Function to add ICE candidate
  const addIceCandidate = useCallback(async (encodedCandidate: string) => {
    if (!peerConnection.current) return;
    try {
      const candidate = JSON.parse(base64Decode(encodedCandidate));
      await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (error) {
      console.error("❌ Error Adding ICE Candidate:", error);
    }
  }, [base64Decode]);

  // Function to create an offer
  const createOffer = useCallback(async () => {
    if (!peerConnection.current) return;
    try {
      const offer = await peerConnection.current.createOffer();
      await peerConnection.current.setLocalDescription(offer);
      setEncodedOffer(base64Encode(JSON.stringify(offer)));
    } catch (error) {
      console.error("❌ Error Creating Offer:", error);
    }
  }, [base64Encode]);

  // Function to accept an offer
  const acceptOffer = useCallback(async (encodedOffer: string) => {
    if (!peerConnection.current) return;
    try {
      const offer = JSON.parse(base64Decode(encodedOffer));
      await peerConnection.current.setRemoteDescription(new RTCSessionDescription(offer));

      peerConnection.current.ondatachannel = (event) => {
        dataChannel.current = event.channel;
        dataChannel.current.onmessage = (event) => setMessages((prev) => [...prev, `Peer: ${event.data}`]);
      };

      const answer = await peerConnection.current.createAnswer();
      await peerConnection.current.setLocalDescription(answer);
      setEncodedAnswer(base64Encode(JSON.stringify(answer)));
    } catch (error) {
      console.error("❌ Error Accepting Offer:", error);
    }
  }, [base64Encode, base64Decode]);

  // Function to submit an answer
  const submitAnswer = useCallback(async (encodedAnswer: string) => {
    if (!peerConnection.current) return;
    try {
      const answer = JSON.parse(base64Decode(encodedAnswer));
      await peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer));
    } catch (error) {
      console.error("❌ Error Submitting Answer:", error);
    }
  }, [base64Decode]);

  // Function to send a message over data channel
  const sendMessage = useCallback((message: string) => {
    if (dataChannel.current?.readyState === "open") {
      dataChannel.current.send(message);
      setMessages((prev) => [...prev, `You: ${message}`]);
    }
  }, []);

  // Function to toggle screen sharing
  const toggleScreenSharing = useCallback(async () => {
    if (isScreenSharing) {
      screenStreamRef.current?.getTracks().forEach((track) => track.stop());
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStream(stream);
      peerConnection.current?.getSenders().find((s) => s.track?.kind === "video")?.replaceTrack(stream.getVideoTracks()[0]);
      setIsScreenSharing(false);
    } else {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        screenStreamRef.current = screenStream;
        setLocalStream(screenStream);
        const sender = peerConnection.current?.getSenders().find((s) => s.track?.kind === "video");
        sender?.replaceTrack(screenStream.getVideoTracks()[0]);
        screenStream.getVideoTracks()[0].onended = () => toggleScreenSharing();
        setIsScreenSharing(true);
      } catch (error) {
        console.error("❌ Error Starting Screen Sharing:", error);
      }
    }
  }, [isScreenSharing]);

  // Function to toggle microphone
  const toggleMic = useCallback(() => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMicOn(audioTrack.enabled);
      }
    }
  }, [localStream]);

  // Function to toggle remote microphone
  const toggleRemoteMic = useCallback(() => {
    if (remoteStream) {
      const audioTrack = remoteStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsRemoteMicOn(audioTrack.enabled);
      }
    }
  }, [remoteStream]);

  // Function to end call
  const endCall = useCallback(() => {
    peerConnection.current?.close();
    peerConnection.current = null;
    dataChannel.current = null;

    localStream?.getTracks().forEach((track) => track.stop());
    remoteStream?.getTracks().forEach((track) => track.stop());

    setLocalStream(null);
    setRemoteStream(null);
    setIsCallActive(false);
    setEncodedOffer(null);
    setEncodedAnswer(null);
    setIsScreenSharing(false);
    setMessages([]);
    setIceCandidates([]);
  }, [localStream, remoteStream]);

  return {
    startCall,
    createOffer,
    acceptOffer,
    submitAnswer,
    sendMessage,
    addIceCandidate,
    toggleScreenSharing,
    toggleMic,
    toggleRemoteMic,
    endCall,
    localStream,
    remoteStream,
    encodedOffer,
    encodedAnswer,
    isScreenSharing,
    isMicOn,
    isRemoteMicOn,
    isCallActive,
    messages,
    iceCandidates,
  };
}
