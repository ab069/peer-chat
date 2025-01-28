import { useState, useRef } from "react";

export default function useWebRTC() {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [encodedOffer, setEncodedOffer] = useState<string | null>(null);
  const [encodedAnswer, setEncodedAnswer] = useState<string | null>(null);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMicOn, setIsMicOn] = useState(true); // Track microphone status
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);

  const base64Encode = (data: string) => btoa(unescape(encodeURIComponent(data)));
  const base64Decode = (data: string) => decodeURIComponent(escape(atob(data)));

  const startCall = async () => {
    console.log("📞 Starting Call...");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStream(stream);
      setIsCallActive(true);

      peerConnection.current = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      });

      stream.getTracks().forEach((track) => {
        console.log(`📡 Sending Track: ${track.kind}`, track);
        peerConnection.current?.addTrack(track, stream);
      });

      peerConnection.current.ontrack = (event) => {
        console.log("✅ Received Remote Stream:", event.streams[0]);
        if (event.streams.length > 0) {
          console.log("🎥 Remote Stream Tracks:", event.streams[0].getTracks());
          setRemoteStream(event.streams[0]);
        }
      };

      peerConnection.current.onicecandidate = (event) => {
        if (event.candidate) console.log("🔄 ICE Candidate Generated:", event.candidate);
      };
    } catch (error) {
      console.error("❌ Error Starting Call:", error);
    }
  };

  const createOffer = async () => {
    if (!peerConnection.current) return;
    try {
      console.log("📨 Creating Offer...");
      const offer = await peerConnection.current.createOffer();
      await peerConnection.current.setLocalDescription(offer);
      setEncodedOffer(base64Encode(JSON.stringify(offer)));
      console.log("✅ Offer Created:", offer);
    } catch (error) {
      console.error("❌ Error Creating Offer:", error);
    }
  };

  const acceptOffer = async (encodedOffer: string) => {
    if (!peerConnection.current) return;
    if (!encodedOffer) {
      console.error("❌ Error: Offer is empty or invalid");
      return;
    }

    try {
      console.log("📥 Accepting Offer...");
      const offer = JSON.parse(base64Decode(encodedOffer));
      await peerConnection.current.setRemoteDescription(new RTCSessionDescription(offer));

      const answer = await peerConnection.current.createAnswer();
      await peerConnection.current.setLocalDescription(answer);
      setEncodedAnswer(base64Encode(JSON.stringify(answer)));

      console.log("✅ Answer Created:", answer);
    } catch (error) {
      console.error("❌ Error Accepting Offer:", error);
    }
  };

  const submitAnswer = async (encodedAnswer: string) => {
    if (!peerConnection.current) return;
    if (!encodedAnswer) {
      console.error("❌ Error: Answer is empty or invalid");
      return;
    }

    try {
      console.log("📤 Submitting Answer...");
      const answer = JSON.parse(base64Decode(encodedAnswer));
      await peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer));
      console.log("✅ Answer Submitted:", answer);
    } catch (error) {
      console.error("❌ Error Submitting Answer:", error);
    }
  };

  const toggleScreenSharing = async () => {
    if (isScreenSharing) {
      screenStreamRef.current?.getTracks().forEach(track => track.stop());
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
  };

  // **New Function: Toggle Microphone**
  const toggleMic = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled; // Toggle audio track
        setIsMicOn(audioTrack.enabled); // Update state
        console.log(`🎤 Microphone ${audioTrack.enabled ? "Enabled" : "Muted"}`);
      }
    }
  };

  const endCall = () => {
    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }

    localStream?.getTracks().forEach((track) => track.stop());
    screenStreamRef.current?.getTracks().forEach((track) => track.stop());
    setLocalStream(null);
    setRemoteStream(null);
    setIsScreenSharing(false);
    setIsCallActive(false);
    console.log("📴 Call Ended.");
  };

  return {
    startCall,
    createOffer,
    acceptOffer,
    submitAnswer,
    toggleScreenSharing,
    toggleMic, // Added mute functionality
    endCall,
    localStream,
    remoteStream,
    encodedOffer,
    encodedAnswer,
    isScreenSharing,
    isMicOn, // Mic status
    isCallActive,
  };
}
