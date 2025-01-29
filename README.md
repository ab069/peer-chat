
```markdown
# WebRTC Next.js Application

This is a simple WebRTC-based video calling application built using Next.js. It allows users to initiate video calls, share their screens, mute/unmute their microphone, and exchange offers/answers for establishing a peer-to-peer connection. It also handles ICE candidates for peer-to-peer connectivity, and you manually input the ICE candidates.

## Features

- **Video Call**: Start a video call with another peer.
- **Screen Sharing**: Share your screen with the remote peer.
- **Mute/Unmute**: Mute or unmute your microphone.
- **Offer/Answer Exchange**: Create and accept offers for peer-to-peer connections.
- **Remote Video Stream**: View the remote peer's video stream.
- **Local Video Stream**: View your own video stream.
- **ICE Candidate Handling**: Manually exchange ICE candidates between peers using input boxes.

## Prerequisites

- Node.js (v14.x or later)
- npm (v6.x or later) or yarn

## Installation

Follow these steps to get the application up and running on your local machine:

1. **Clone the repository**:

   ```bash
   git clone https://github.com/yourusername/webrtc-nextjs.git
   cd webrtc-nextjs
   ```

2. **Install dependencies**:

   Using npm:

   ```bash
   npm install
   ```

   Or using yarn:

   ```bash
   yarn install
   ```

3. **Run the development server**:

   Using npm:

   ```bash
   npm run dev
   ```

   Or using yarn:

   ```bash
   yarn dev
   ```

4. **Open the app in your browser**:

   Open your browser and go to [http://localhost:3000](http://localhost:3000).

## Usage

### 1. **Start a Call**
   - Click on the **"Start Call"** button to initiate a video call.
   - The app will request permission to access your camera and microphone.

### 2. **Create an Offer**
   - After starting the call, click on **"Create Offer"** to generate an offer for the peer-to-peer connection.
   - The offer will be displayed in a text area for you to share with the remote peer.

### 3. **Accept an Offer**
   - The remote peer can share their offer with you.
   - Paste the offer into the **"Offer"** input box and click **"Accept Offer"** to initiate the connection.

### 4. **Submit an Answer**
   - After accepting the offer, you need to generate an answer.
   - Paste the answer into the **"Answer"** input box and click **"Submit Answer"** to complete the connection.

### 5. **ICE Candidate Handling**
   - **ICE Candidates** are used to establish a stable peer-to-peer connection. You need to manually exchange ICE candidates between the peers.
   - When creating the offer or answering it, the ICE candidates will be collected and displayed in the respective input boxes.
   - **How to exchange ICE candidates**:
     - After the offer is created, ICE candidates will be displayed in the **"ICE Candidates (Offer)"** input box.
     - Copy these candidates and paste them into the **"ICE Candidates (Answer)"** input box on the remote peer's side.
     - The remote peer will then send their ICE candidates back to you.
     - Paste the remote peer's ICE candidates into the **"ICE Candidates (Offer)"** input box on your side to establish the connection.

### 6. **Mute/Unmute Microphone**
   - Click on the **"Mute Mic"** button to mute your microphone or **"Unmute Mic"** to unmute it.

### 7. **Share/Stop Screen Sharing**
   - Click on the **"Share Screen"** button to start sharing your screen.
   - Click **"Stop Sharing"** to stop screen sharing.

### 8. **End Call**
   - Click on the **"End Call"** button to terminate the call.

## Troubleshooting

- **No Video Stream**: Ensure that your browser has permissions to access your camera and microphone. If you're running the app locally, make sure you're on `localhost` or a secure HTTPS server.
- **Browser Compatibility**: This app uses WebRTC, which is supported by most modern browsers (Chrome, Firefox, Safari, Edge). Make sure you're using a supported browser.
- **ICE Candidate Issues**: If you're facing connectivity issues, make sure that the ICE candidates are being properly exchanged between peers. This can be checked in the browser's developer tools console for any missing or failed candidate exchanges.

## Technologies Used

- **Next.js**: A React framework for building server-side rendered applications.
- **WebRTC**: A technology that allows real-time peer-to-peer communication between browsers.
- **React**: A JavaScript library for building user interfaces.
- **TypeScript**: A typed superset of JavaScript that provides type safety and better tooling.

## Contributing

If you'd like to contribute to this project, feel free to fork the repository and submit a pull request. Please make sure to follow the existing code style and write tests for any new features or fixes.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
```

### Key Changes:
- **ICE Candidate Handling**: The README now clearly explains that ICE candidates are manually exchanged between peers using the provided input boxes. The user is instructed to copy the candidates from one peer and paste them into the other peer's corresponding input box.
- **Manual Exchange Process**: The instructions are updated to reflect the manual process of exchanging ICE candidates between peers.

This updated README should provide users with clear instructions on how to manually handle ICE candidates in your WebRTC application.