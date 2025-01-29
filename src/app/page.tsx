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
    toggleMic, 
    toggleRemoteMic,
    sendMessage,
    addIceCandidate,
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
      <h1 className="text-3xl font-bold mb-6">WebRTC Chat & Video Call</h1>
      
      <div className="flex space-x-4 mb-6">
        {!isCallActive && <button onClick={startCall} className="px-4 py-2 bg-green-500 rounded">Start Call</button>}
        {isCallActive && <button onClick={createOffer} className="px-4 py-2 bg-blue-500 rounded">Create Offer</button>}
        {isCallActive && <button onClick={() => acceptOffer(offerText)} className="px-4 py-2 bg-purple-500 rounded">Accept Offer</button>}
        {isCallActive && <button onClick={() => submitAnswer(answerText)} className="px-4 py-2 bg-pink-500 rounded">Submit Answer</button>}
        {isCallActive && <button onClick={toggleScreenSharing} className="px-4 py-2 bg-orange-500 rounded">{isScreenSharing ? "Stop Sharing" : "Share Screen"}</button>}
        {isCallActive && <button onClick={toggleMic} className="px-4 py-2 bg-yellow-500 rounded">{isMicOn ? "Mute Mic" : "Unmute Mic"}</button>}
        {isCallActive && <button onClick={toggleRemoteMic} className="px-4 py-2 bg-red-500 rounded">{isRemoteMicOn ? "Mute Remote Mic" : "Unmute Remote Mic"}</button>}      </div>
      
      {isCallActive && (
        <div className="flex flex-col items-center space-y-4 w-full max-w-lg">
          <textarea className="w-full p-2 bg-gray-800 rounded" value={encodedOffer || ""} readOnly />
          <textarea className="w-full p-2 bg-gray-800 rounded" value={offerText} onChange={(e) => setOfferText(e.target.value)} placeholder="Paste Offer Here" />
          <textarea className="w-full p-2 bg-gray-800 rounded" value={encodedAnswer || ""} readOnly />
          <textarea className="w-full p-2 bg-gray-800 rounded" value={answerText} onChange={(e) => setAnswerText(e.target.value)} placeholder="Paste Answer Here" />
        </div>
      )}
      
      {isCallActive && (
        <div className="mt-6 w-full max-w-lg">
          <h2 className="text-xl font-semibold">Chat</h2>
          <div className="h-40 overflow-y-auto bg-gray-800 p-2 rounded mb-2">
            {messages.map((msg, index) => <p key={index} className="text-sm">{msg}</p>)}
          </div>
          <input type="text" value={messageText} onChange={(e) => setMessageText(e.target.value)} placeholder="Type a message" className="w-full p-2 bg-gray-800 rounded mb-2" />
          <button onClick={() => sendMessage(messageText)} className="px-4 py-2 bg-blue-500 rounded">Send</button>
        </div>
      )}
      
      {isCallActive && (
        <div className="mt-6 w-full max-w-lg">
          <h2 className="text-xl font-semibold">ICE Candidates</h2>
          <div className="h-20 overflow-y-auto bg-gray-800 p-2 rounded mb-2">
            {iceCandidates.map((ice, index) => <p key={index} className="text-sm break-words">{ice}</p>)}
          </div>
          <input type="text" value={iceText} onChange={(e) => setIceText(e.target.value)} placeholder="Paste ICE Candidate" className="w-full p-2 bg-gray-800 rounded mb-2" />
          <button onClick={() => addIceCandidate(iceText)} className="px-4 py-2 bg-purple-500 rounded">Add ICE</button>
        </div>
      )}
      
      {isCallActive && (
        <div className="grid grid-cols-2 gap-4 mt-6">
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
