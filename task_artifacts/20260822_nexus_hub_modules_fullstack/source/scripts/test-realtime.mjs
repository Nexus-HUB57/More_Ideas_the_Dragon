import WebSocket from "ws";

const url = process.env.REALTIME_URL ?? "ws://127.0.0.1:3000/api/realtime";
const socket = new WebSocket(url);
const timeout = setTimeout(() => {
  console.error("WebSocket handshake timeout");
  socket.close();
  process.exit(1);
}, 5000);

socket.once("open", () => {
  console.log("WebSocket handshake: open");
});

socket.once("message", raw => {
  const message = JSON.parse(raw.toString());
  if (message.type !== "realtime.connected") {
    console.error("Unexpected handshake message", message);
    clearTimeout(timeout);
    socket.close();
    process.exit(1);
  }
  console.log("WebSocket handshake: connected");
  clearTimeout(timeout);
  socket.close();
});

socket.once("error", error => {
  console.error("WebSocket handshake failed", error.message);
  clearTimeout(timeout);
  process.exit(1);
});
