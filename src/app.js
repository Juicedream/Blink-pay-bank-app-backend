const express = require("express");
const NotFoundError = require("./middleware/404Handling");
const ApiError = require("./utils/ApiError");
const app = express();
const http = require("http");
const morgan = require("morgan");
const cors = require("cors");
const transferSocket = require("./config/socket");
const server = http.createServer(app);
const webSocket = require("ws");
// Json parse
app.use(express.json());

const wss = new webSocket.Server({ server });

//track connections
wss.on("connection", (ws) => {
  // console.log(ws);
  console.log("Client connected from Mmesoma's side test page ✅");

    // ws.send(
    //   JSON.stringify({
    //     event: "welcome",
    //     data: { message: "Hello from the server!" },
    //   })
    // );

  ws.on("message", (data) => {
    console.log("Message from client Mmesoma's test page: ", data.toString());
  });

  ws.on("close", () => {
    console.log("Client Disconnected ❌");
  });
});


export function triggerSocketEvent(event, data) {
  console.log("Triggering event:", event, "with data:", data);
  const payload = JSON.stringify({ event, data });
  wss.clients.forEach((client) => {
    if (client.readyState === webSocket.OPEN) {
      client.send(payload);
    }
  });
}


const allowedOrigins = [
  "https://blink-pay.vercel.app", // production
  /^http:\/\/localhost:\d+$/, // allow any localhost port
  "https://payverge.netlify.app", // staging
  /^http:\/\/127\.0\.0\.1:\d+$/, // allow 127.0.0.1 ports
  /^http:\/\/192\.168\.\d+\.\d+:\d+$/, // allow LAN IPs (teammates in dev)
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      // check if origin matches any string or regex
      if (
        allowedOrigins.some((o) =>
          o instanceof RegExp ? o.test(origin) : o === origin
        )
      ) {
        return callback(null, true);
      } else {
        return callback(new Error("Not allowed by CORS: " + origin));
      }
    },
    credentials: true,
  })
);

app.use(morgan("dev"));

app.use("/api/v1", require("./router"));

transferSocket(server);

app.get("/", (req, res) => {
  res.send({ status: "ok" });
});

app.use("", (req, res, next) => {
  next(new ApiError(404, "Not Found"));
});

app.use(NotFoundError);

module.exports = server;
