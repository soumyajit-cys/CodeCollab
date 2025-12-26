import { socket } from "../collaboration/socket.js";

const chatWindow = document.getElementById("chat-window");
const input = document.getElementById("message-input");

input.addEventListener("keydown", () => {
  socket.emit("typing", { receiver_id: activePeer });
});

input.addEventListener("keypress", e => {
  if (e.key === "Enter") {
    socket.emit("send_message", {
      receiver_id: activePeer,
      content: input.value
    });
    input.value = "";
  }
});

socket.on("message_received", msg => {
  renderMessage(msg);
});