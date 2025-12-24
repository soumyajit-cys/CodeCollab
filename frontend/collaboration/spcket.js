import { io } from "https://cdn.socket.io/4.7.2/socket.io.esm.min.js";

export const socket = io("/ws", {
  auth: {
    token: localStorage.getItem("access_token")
  }
});