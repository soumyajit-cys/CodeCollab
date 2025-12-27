import { socket } from "../collaboration/socket.js";

const pc = new RTCPeerConnection({
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    {
      urls: "turn:turn.yourdomain.com:3478",
      username: "turnuser",
      credential: "turnpassword"
    }
  ]
});

const localVideo = document.getElementById("localVideo");
const remoteVideo = document.getElementById("remoteVideo");

const stream = await navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
});

stream.getTracks().forEach(track => pc.addTrack(track, stream));
localVideo.srcObject = stream;

pc.ontrack = event => {
  remoteVideo.srcObject = event.streams[0];
};

pc.onicecandidate = e => {
  if (e.candidate) {
    socket.emit("ice_candidate", {
      peer_id: activePeer,
      candidate: e.candidate
    });
  }
};