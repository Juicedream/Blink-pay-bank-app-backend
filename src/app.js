const express = require("express");
const NotFoundError = require("./middleware/404Handling");
const ApiError = require("./utils/ApiError");
const app = express();
const http = require("http")
const morgan = require("morgan")
const cors = require('cors');
const transferSocket = require("./config/socket");
const server = http.createServer(app);
// Json parse
app.use(express.json())

const allowedOrigins = [
   // local backend
  "http://localhost:8000", // local frontend from payverge
  "https://blink-pay.vercel.app", // production frontend
];
app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like mobile apps, curl, Postman)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // if you need cookies/auth headers
  })
);
app.use(morgan("dev"))

app.use("/api/v1", require("./router"))

transferSocket(server)

app.get("/", (req, res) => {
    res.send({status: "ok"});
});

app.use("", (req, res, next) => {
    next(new ApiError(404, "Not Found"))
})

app.use(NotFoundError);

module.exports = server;