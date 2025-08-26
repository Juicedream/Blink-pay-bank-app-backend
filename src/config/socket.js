const { Server } = require("socket.io");
const { eventBus } = require("../events/eventBus");

function transferSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: "",
    },
  });
  io.on("connection", (socket) => {
    console.log("Client connected: ", socket.id);

    eventBus.on("money:sent", (payload) => {
      io.to(payload.sender_name).emit("money:sent", payload);
    });

    eventBus.on("money:paid", (payload) => {
        io.to(payload.bank).emit("money:paid", payload);
    })

    eventBus.on("money:received", (payload) => {
        io.to(payload.receiver_name).emit("money:received", payload)
    });

    socket.on('join', (name) => {
        socket.join(name)
    })
  });
}

module.exports = transferSocket
