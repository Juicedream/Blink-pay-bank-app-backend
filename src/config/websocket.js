const WebSocket = require("ws");

let wss; // keep a reference to the WebSocket server

function initSocket(server) {
  wss = new WebSocket.Server({ server });

  wss.on("connection", (ws) => {
    console.log("Client connected ✅");

    ws.on("message", (data) => {
      console.log("Message from client:", data.toString());
    });

    ws.on("close", () => {
      console.log("Client disconnected ❌");
    });
  });

  console.log("WebSocket server initialized 🚀");
}

// Trigger an event to all clients
function triggerSocketEvent(event, data) {
    console.log("Triggering event:", event, data);
  if (!wss) {
    console.error("WebSocket server not initialized!");
    return;
  }

  const payload = JSON.stringify({ event, data });
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  });
}

module.exports = { initSocket, triggerSocketEvent };
