import { useEffect, useRef, useState } from "react";
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
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const dataChannel = useRef<RTCDataChannel | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);

  const base64Encode = (data: string) => btoa(unescape(encodeURIComponent(data)));
  const base64Decode = (data: string) => decodeURIComponent(escape(atob(data)));

  const startCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStream(stream);
      setIsCallActive(true);

      peerConnection.current = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      });

      dataChannel.current = peerConnection.current.createDataChannel("chat");
      dataChannel.current.onmessage = (event) => {
        setMessages((prev) => [...prev, `Peer: ${event.data}`]);
      };
      dataChannel.current.onopen = () => console.log("📡 Data Channel Opened");
      dataChannel.current.onclose = () => console.log("📴 Data Channel Closed");

      stream.getTracks().forEach((track) => peerConnection.current?.addTrack(track, stream));

      peerConnection.current.ontrack = (event) => {
        if (event.streams.length > 0) setRemoteStream(event.streams[0]);
      };

      peerConnection.current.onicecandidate = (event) => {
        if (event.candidate) {
          console.log("🔄 ICE Candidate Generated:", event.candidate);
          setIceCandidates((prev) => [...prev, base64Encode(JSON.stringify(event.candidate))]);
        }
      };
    } catch (error) {
      console.error("❌ Error Starting Call:", error);
    }
  };

  const addIceCandidate = async (encodedCandidate: string) => {
    if (!peerConnection.current) return;
    try {
      const candidate = JSON.parse(base64Decode(encodedCandidate));
      await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
      console.log("✅ ICE Candidate Added:", candidate);
    } catch (error) {
      console.error("❌ Error Adding ICE Candidate:", error);
    }
  };

  const createOffer = async () => {
    if (!peerConnection.current) return;
    try {
      const offer = await peerConnection.current.createOffer();
      await peerConnection.current.setLocalDescription(offer);
      setEncodedOffer(base64Encode(JSON.stringify(offer)));
    } catch (error) {
      console.error("❌ Error Creating Offer:", error);
    }
  };

  const acceptOffer = async (encodedOffer: string) => {
    if (!peerConnection.current) return;
    try {
      const offer = JSON.parse(base64Decode(encodedOffer));
      await peerConnection.current.setRemoteDescription(new RTCSessionDescription(offer));
      
      peerConnection.current.ondatachannel = (event) => {
        dataChannel.current = event.channel;
        dataChannel.current.onmessage = (event) => {
          setMessages((prev) => [...prev, `Peer: ${event.data}`]);
        };
      };
      
      const answer = await peerConnection.current.createAnswer();
      await peerConnection.current.setLocalDescription(answer);
      setEncodedAnswer(base64Encode(JSON.stringify(answer)));
    } catch (error) {
      console.error("❌ Error Accepting Offer:", error);
    }
  };

  const submitAnswer = async (encodedAnswer: string) => {
    if (!peerConnection.current) return;
    try {
      const answer = JSON.parse(base64Decode(encodedAnswer));
      await peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer));
    } catch (error) {
      console.error("❌ Error Submitting Answer:", error);
    }
  };

  const sendMessage = (message: string) => {
    if (dataChannel.current && dataChannel.current.readyState === "open") {
      dataChannel.current.send(message);
      setMessages((prev) => [...prev, `You: ${message}`]);
    }
  };

  const toggleScreenSharing = async () => {
    if (isScreenSharing) {
      screenStreamRef.current?.getTracks().forEach(track => track.stop());
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStream(stream);
      peerConnection.current?.getSenders().find(s => s.track?.kind === "video")?.replaceTrack(stream.getVideoTracks()[0]);
      setIsScreenSharing(false);
    } else {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        screenStreamRef.current = screenStream;
        setLocalStream(screenStream);
        const sender = peerConnection.current?.getSenders().find(s => s.track?.kind === "video");
        sender?.replaceTrack(screenStream.getVideoTracks()[0]);
        screenStream.getVideoTracks()[0].onended = () => toggleScreenSharing();
        setIsScreenSharing(true);
      } catch (error) {
        console.error("❌ Error Starting Screen Sharing:", error);
      }
    }
  };

  const toggleMic = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMicOn(audioTrack.enabled);
      }
    }
  };

  return {
    startCall,
    createOffer,
    acceptOffer,
    submitAnswer,
    sendMessage,
    addIceCandidate,
    toggleScreenSharing,
    toggleMic,
    localStream,
    remoteStream,
    encodedOffer,
    encodedAnswer,
    isScreenSharing,
    isMicOn,
    isCallActive,
    messages,
    iceCandidates,
  };
}
