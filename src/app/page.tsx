"use client";
import useWebRTC from "./hooks/useWebRTC";
import { useState } from "react";

export default function Home() {
  const { startCall, createOffer, submitAnswer, acceptOffer, toggleCamera, toggleMic, toggleScreenSharing, endCall, localStreams, remoteStreams, encodedOffer, encodedAnswer, isCameraOn, isMicOn, isScreenSharing } = useWebRTC();
  const [offerText, setOfferText] = useState<string>("");
  const [answerText, setAnswerText] = useState<string>("");

  // Function to copy text to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert("Copied to clipboard!");
    });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <h1 className="text-3xl font-bold mb-4">WebRTC Peer-to-Peer Chat</h1>

      {/* Buttons for Call Controls */}
      <div className="flex space-x-4 mb-4">
        <button onClick={startCall} className="p-2 bg-green-500 rounded">Start Call</button>
        <button onClick={toggleCamera} className="p-2 bg-blue-500 rounded">
          {isCameraOn ? "Turn Camera Off" : "Turn Camera On"}
        </button>
        <button onClick={toggleMic} className="p-2 bg-yellow-500 rounded">
          {isMicOn ? "Mute Mic" : "Unmute Mic"}
        </button>
        <button onClick={toggleScreenSharing} className="p-2 bg-orange-500 rounded">
          {isScreenSharing ? "Stop Sharing Screen" : "Share Screen"}
        </button>
        <button onClick={createOffer} className="p-2 bg-purple-500 rounded">Create Offer</button>
        <button onClick={() => acceptOffer(offerText)} className="p-2 bg-pink-500 rounded">Accept Offer</button>
        <button onClick={() => submitAnswer(answerText)} className="p-2 bg-indigo-500 rounded">Submit Answer</button>
        <button onClick={endCall} className="p-2 bg-red-500 rounded">End Call</button>
      </div>

      {/* Offer & Answer Exchange */}
      <div className="w-full max-w-lg">
        <div className="mb-4 flex items-center">
          <label className="block mb-2 mr-2">Offer (Copy and Share)</label>
          <button 
            onClick={() => copyToClipboard(encodedOffer || '')} 
            className="p-2 bg-gray-600 rounded text-sm">
            Copy
          </button>
        </div>
        <textarea
          className="w-80 p-2 bg-gray-800 rounded"
          value={encodedOffer || ""}
          readOnly
        />
      </div>

      <div className="mb-4 flex items-center">
        <label className="block mb-2 mr-2">Paste Offer (From Other Tab)</label>
        <button 
          onClick={() => copyToClipboard(offerText)} 
          className="p-2 bg-gray-600 rounded text-sm">
          Copy
        </button>
      </div>
      <textarea
        className="w-80 p-2 bg-gray-800 rounded"
        value={offerText}
        onChange={(e) => setOfferText(e.target.value)}
      />

      <div className="mb-4 flex items-center">
        <label className="block mb-2 mr-2">Answer (Copy and Share)</label>
        <button 
          onClick={() => copyToClipboard(encodedAnswer || '')} 
          className="p-2 bg-gray-600 rounded text-sm">
          Copy
        </button>
      </div>
      <textarea
        className="w-80 p-2 bg-gray-800 rounded"
        value={encodedAnswer || ""}
        readOnly
      />

      <div className="mb-4 flex items-center">
        <label className="block mb-2 mr-2">Paste Answer (From Other Tab)</label>
        <button 
          onClick={() => copyToClipboard(answerText)} 
          className="p-2 bg-gray-600 rounded text-sm">
          Copy
        </button>
      </div>
      <textarea
        className="w-80 p-2 bg-gray-800 rounded"
        value={answerText}
        onChange={(e) => setAnswerText(e.target.value)}
      />

      {/* Displaying Local and Remote Streams */}
      <div className="grid grid-cols-2 gap-4">
        {localStreams.map((stream, index) => (
          <video
            key={`local-${index}`}
            ref={(vid) => {
              if (vid) vid.srcObject = stream;
            }}
            autoPlay
            muted
            className="border rounded-lg w-64 h-48"
          />
        ))}
        {remoteStreams.map((stream, index) => (
          <video
            key={`remote-${index}`}
            ref={(vid) => {
              if (vid) vid.srcObject = stream;
            }}
            autoPlay
            playsInline
            className="border rounded-lg w-64 h-48"
          />
        ))}
      </div>
    </div>
  );
}
