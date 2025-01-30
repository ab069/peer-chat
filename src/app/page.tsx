"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import useWebRTC from "./hooks/useWebRTC";

export default function Home() {
  const {
    startCall,
    createOffer,
    acceptOffer,
    submitAnswer,
    toggleScreenSharing,
    toggleMic,
    toggleRemoteMic,
    sendMessage,
    addIceCandidate,
    endCall, // Add end call function
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
  } = useWebRTC();

  const [offerText, setOfferText] = useState("");
  const [answerText, setAnswerText] = useState("");
  const [messageText, setMessageText] = useState("");
  const [iceText, setIceText] = useState("");
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [showSignaling, setShowSignaling] = useState(false);

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

  // Memoization to prevent unnecessary re-renders
  const chatMessages = useMemo(() => messages, [messages]);
  const iceList = useMemo(() => iceCandidates, [iceCandidates]);

  // Callbacks for actions
  const handleCopy = useCallback((text: string) => {
    if (!text.trim()) {
      setAlertMessage("Nothing to copy!");
      setTimeout(() => {
        setAlertMessage(null);
      }, 2000);
      return;
    }

    navigator.clipboard.writeText(text)
      .then(() => {
        setAlertMessage("Copied to clipboard!");
        setTimeout(() => {
          setAlertMessage(null);
        }, 2000);
      })
      .catch((err) => console.error("Failed to copy text:", err));
  }, []);
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-3xl font-bold mb-6">WebRTC Chat & Video Call</h1>
  
      {/* Buttons */}
      <div className="flex space-x-4 mb-6">
        {alertMessage && (
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 bg-green-500 text-white p-2 rounded shadow-md">
            {alertMessage}
          </div>
        )}
        {!isCallActive && (
          <button onClick={startCall} className="px-4 py-2 bg-green-500 rounded">
            Start Call
          </button>
        )}
        {isCallActive && (
          <>
           <button onClick={() => setShowSignaling(!showSignaling)} className="px-4 py-2 bg-purple-600 rounded">
            {showSignaling ? "Hide Signaling" : "Show Signaling"}
          </button>
            <button onClick={() => {
  createOffer();
  setShowSignaling(!showSignaling);
}}className="px-4 py-2 bg-blue-500 rounded">Create Offer</button>
            <button onClick={() => acceptOffer(offerText)} className="px-4 py-2 bg-purple-500 rounded">Accept Offer</button>
            <button onClick={() => submitAnswer(answerText)} className="px-4 py-2 bg-pink-500 rounded">Submit Answer</button>
            <button onClick={toggleScreenSharing} className="px-4 py-2 bg-orange-500 rounded">
              {isScreenSharing ? "Stop Sharing" : "Share Screen"}
            </button>
            <button onClick={toggleMic} className="px-4 py-2 bg-yellow-500 rounded">
              {isMicOn ? "Mute Mic" : "Unmute Mic"}
            </button>
            <button onClick={toggleRemoteMic} className="px-4 py-2 bg-red-500 rounded">
              {isRemoteMicOn ? "Mute Remote Mic" : "Unmute Remote Mic"}
            </button>
            <button onClick={endCall} className="px-4 py-2 bg-gray-500 rounded">End Call</button>
          </>
        )}
      </div>
  
     {/* Dynamic Layout: 2 Columns (50/50) or 3 Columns (33/33/33) */}
     {isCallActive && (
      <div className={`grid ${showSignaling ? "grid-cols-3" : "grid-cols-2"} gap-6 w-full max-w-6xl`}>
        
        {/* Video Streams */}
        <div className="flex flex-col items-center space-y-4">
          <h2 className="text-xl font-semibold">Video Streams</h2>
          <div className="flex flex-col items-center">
            <label className="text-sm font-semibold mb-1">Local Stream:</label>
            <video ref={localVideoRef} autoPlay muted playsInline className="border w-full max-w-md h-auto rounded-lg" />
          </div>
          <div className="flex flex-col items-center">
            <label className="text-sm font-semibold mb-1">Remote Stream:</label>
            <video ref={remoteVideoRef} autoPlay playsInline className="border w-full max-w-md h-auto rounded-lg" />
          </div>
        </div>

        {/* Chat Box */}
        <div className="flex flex-col items-center w-full">
          <h2 className="text-xl font-semibold">Chat</h2>
          <div className="h-64 w-full bg-gray-800 p-2 rounded mb-2 overflow-y-auto">
            {chatMessages.map((msg, index) => (
              <p key={index} className="text-sm">{msg}</p>
            ))}
          </div>
          <input
            type="text"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Type a message"
            className="w-full p-2 bg-gray-800 rounded mb-2"
          />
          <button onClick={() => sendMessage(messageText)} className="px-4 py-2 bg-blue-500 rounded">Send</button>
        </div>

        {/* Signaling Section (Hidden by Default) */}
        {showSignaling && (
          <div className="flex flex-col items-center space-y-4 w-full">
            <h2 className="text-xl font-semibold">Signaling</h2>
            
            {/* Offer */}
            <div className="flex w-full">
              <textarea className="w-full p-2 bg-gray-800 rounded" value={encodedOffer || ""} readOnly />
              <button onClick={() => handleCopy(encodedOffer)} className="ml-2 px-4 py-2 bg-gray-600 rounded">Copy</button>
            </div>
            <textarea className="w-full p-2 bg-gray-800 rounded" value={offerText} onChange={(e) => setOfferText(e.target.value)} placeholder="Paste Offer Here" />
            
            {/* Answer */}
            <div className="flex w-full">
              <textarea className="w-full p-2 bg-gray-800 rounded" value={encodedAnswer || ""} readOnly />
              <button onClick={() => handleCopy(encodedAnswer)} className="ml-2 px-4 py-2 bg-gray-600 rounded">Copy</button>
            </div>
            <textarea className="w-full p-2 bg-gray-800 rounded" value={answerText} onChange={(e) => setAnswerText(e.target.value)} placeholder="Paste Answer Here" />

            {/* ICE Candidates */}
            <h2 className="text-xl font-semibold">ICE Candidates</h2>
            <div className="h-40 overflow-y-auto bg-gray-800 p-2 rounded mb-2 space-y-2">
              {iceList.map((ice, index) => (
                <div key={index} className="flex items-center bg-gray-700 p-2 rounded">
                  <input type="text" value={ice} readOnly className="w-full bg-transparent text-white p-1 outline-none" />
                  <button onClick={() => handleCopy(ice)} className="ml-2 px-3 py-1 bg-blue-500 text-white rounded">Copy</button>
                </div>
              ))}
            </div>
            <input type="text" value={iceText} onChange={(e) => setIceText(e.target.value)} placeholder="Paste ICE Candidate" className="w-full p-2 bg-gray-800 rounded mb-2" />
            <button onClick={() => addIceCandidate(iceText)} className="px-4 py-2 bg-purple-500 rounded">Add ICE</button>
          </div>
        )}
      </div>
    )}
  </div>
);
}