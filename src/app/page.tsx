"use client";

import { useEffect, useRef, useState } from "react";
import useWebRTC from "./hooks/useWebRTC";

export default function Home() {
  const {
    startCall,
    createOffer,
    acceptOffer,
    submitAnswer,
    toggleScreenSharing,
    toggleMic, // Mute functionality
    endCall,
    localStream,
    remoteStream,
    encodedOffer,
    encodedAnswer,
    isScreenSharing,
    isMicOn, // Mic status
    isCallActive,
  } = useWebRTC();

  const [offerText, setOfferText] = useState<string>("");
  const [answerText, setAnswerText] = useState<string>("");

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
    </div>
  );
}
