import { useEffect, useRef, useState } from "react";

// WebRTC hook (useWebRTC)
const useWebRTC = () => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [encodedOffer, setEncodedOffer] = useState<string | null>(null);
  const [encodedAnswer, setEncodedAnswer] = useState<string | null>(null);
  const [offerText, setOfferText] = useState<string>("");
  const [answerText, setAnswerText] = useState<string>("");
  const [isCallActive, setIsCallActive] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isMicOn, setIsMicOn] = useState(true);
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const [iceCandidates, setIceCandidates] = useState<RTCIceCandidate[]>([]);

  // Media constraints for video and audio
  const mediaConstraints = {
    video: true,
    audio: true,
  };

  useEffect(() => {
    // Get local media stream
    const getLocalStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia(mediaConstraints);
        setLocalStream(stream);
      } catch (err) {
        console.error("Error accessing media devices.", err);
      }
    };
    getLocalStream();
  }, []);

  const startCall = () => {
    setIsCallActive(true);
    createPeerConnection();
  };

  const createPeerConnection = () => {
    const pc = new RTCPeerConnection();
  
    // Add ICE candidate event listener
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        setIceCandidates((prevCandidates) => [
          ...prevCandidates.filter((candidate) => candidate !== null), // Filter out null candidates
          event.candidate, // Add valid ICE candidate
        ]);
      }
    };
  
    // Add remote stream event listener
    pc.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
    };
  
    if (localStream) {
      localStream.getTracks().forEach((track) => {
        pc.addTrack(track, localStream);
      });
    }
  
    peerConnection.current = pc;
  };
  

  const createOffer = async () => {
    if (peerConnection.current) {
      try {
        const offer = await peerConnection.current.createOffer();
        await peerConnection.current.setLocalDescription(offer);
        setEncodedOffer(JSON.stringify(offer));
        setOfferText(JSON.stringify(offer));
        console.log("Offer created:", offer);
      } catch (error) {
        console.error("Error creating offer:", error);
      }
    }
  };

  const acceptOffer = async (offer: string) => {
    if (peerConnection.current) {
      try {
        const offerObj = JSON.parse(offer);
        await peerConnection.current.setRemoteDescription(new RTCSessionDescription(offerObj));

        const answer = await peerConnection.current.createAnswer();
        await peerConnection.current.setLocalDescription(answer);
        setEncodedAnswer(JSON.stringify(answer));
        setAnswerText(JSON.stringify(answer));
        console.log("Answer created:", answer);
      } catch (error) {
        console.error("Error accepting offer:", error);
      }
    }
  };

  const submitAnswer = async (answer: string) => {
    if (peerConnection.current) {
      try {
        const answerObj = JSON.parse(answer);
        await peerConnection.current.setRemoteDescription(new RTCSessionDescription(answerObj));
        console.log("Answer submitted:", answer);
      } catch (error) {
        console.error("Error submitting answer:", error);
      }
    }
  };

  const toggleScreenSharing = async () => {
    if (isScreenSharing) {
      // Stop screen sharing
      const tracks = localStream?.getTracks();
      tracks?.forEach((track) => {
        if (track.kind === "video") {
          track.stop();
        }
      });
      setIsScreenSharing(false);
    } else {
      // Start screen sharing
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        setLocalStream(stream);
        stream.getTracks().forEach((track) => {
          if (peerConnection.current) {
            peerConnection.current.addTrack(track, stream);
          }
        });
        setIsScreenSharing(true);
      } catch (err) {
        console.error("Error starting screen sharing", err);
      }
    }
  };

  const toggleMic = () => {
    if (localStream) {
      localStream.getTracks().forEach((track) => {
        if (track.kind === "audio") {
          track.enabled = !track.enabled;
          setIsMicOn(track.enabled);
        }
      });
    }
  };

  const endCall = () => {
    if (peerConnection.current) {
      peerConnection.current.close();
    }
    setIsCallActive(false);
    setLocalStream(null);
    setRemoteStream(null);
  };

  return {
    startCall,
    createOffer,
    acceptOffer,
    submitAnswer,
    toggleScreenSharing,
    toggleMic,
    endCall,
    localStream,
    remoteStream,
    encodedOffer,
    encodedAnswer,
    iceCandidates,
    isScreenSharing,
    isMicOn,
    isCallActive,
    offerText,
    setOfferText,
    answerText,
    setAnswerText,
  };
};

// Main Component
export default function Home() {
  const {
    startCall,
    createOffer,
    acceptOffer,
    submitAnswer,
    toggleScreenSharing,
    toggleMic,
    endCall,
    localStream,
    remoteStream,
    encodedOffer,
    encodedAnswer,
    iceCandidates,
    isScreenSharing,
    isMicOn,
    isCallActive,
    offerText,
    setOfferText,
    answerText,
    setAnswerText,
  } = useWebRTC();

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-3xl font-bold mb-6">WebRTC with Mute Option</h1>

      {/* Buttons */}
      <div className="flex space-x-4 mb-6">
        {!isCallActive && <button onClick={startCall} className="px-4 py-2 bg-green-500 rounded">Start Call</button>}
        {isCallActive && <button onClick={createOffer} className="px-4 py-2 bg-blue-500 rounded">Create Offer</button>}
        {isCallActive && <button onClick={() => acceptOffer(offerText)} className="px-4 py-2 bg-purple-500 rounded">Accept Offer</button>}
        {isCallActive && <button onClick={() => submitAnswer(answerText)} className="px-4 py-2 bg-pink-500 rounded">Submit Answer</button>}
        {isCallActive && (
          <button onClick={toggleScreenSharing} className="px-4 py-2 bg-orange-500 rounded">
            {isScreenSharing ? "Stop Sharing" : "Share Screen"}
          </button>
        )}
        {isCallActive && (
          <button onClick={toggleMic} className="px-4 py-2 bg-yellow-500 rounded">
            {isMicOn ? "Mute Mic" : "Unmute Mic"}
          </button>
        )}
        {isCallActive && <button onClick={endCall} className="px-4 py-2 bg-red-700 rounded">End Call</button>}
      </div>

      {/* Offer & Answer Exchange UI */}
      {isCallActive && (
        <>
          <textarea className="w-80 p-2 bg-gray-800 rounded mb-2" value={encodedOffer || ""} readOnly />
          <textarea className="w-80 p-2 bg-gray-800 rounded mb-2" value={offerText} onChange={(e) => setOfferText(e.target.value)} />
          <textarea className="w-80 p-2 bg-gray-800 rounded mb-2" value={encodedAnswer || ""} readOnly />
          <textarea className="w-80 p-2 bg-gray-800 rounded mb-2" value={answerText} onChange={(e) => setAnswerText(e.target.value)} />
        </>
      )}

      {/* Video Streams */}
      {isCallActive && (
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col items-center">
            <label className="text-sm font-semibold mb-1">Local Stream:</label>
            <video ref={localVideoRef} autoPlay muted playsInline className="border w-64 h-48 rounded-lg" />
          </div>
          <div className="flex flex-col items-center">
            <label className="text-sm font-semibold mb-1">Remote Stream:</label>
            <video ref={remoteVideoRef} autoPlay playsInline className="border w-64 h-48 rounded-lg" />
          </div>
        </div>
      )}

      {/* ICE Candidates */}
      <div className="mt-4">
        <h3 className="text-lg font-semibold">ICE Candidates:</h3>
        <ul>
          {iceCandidates.map((candidate, index) => (
            <li key={index} className="text-sm text-gray-400">{JSON.stringify(candidate)}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
