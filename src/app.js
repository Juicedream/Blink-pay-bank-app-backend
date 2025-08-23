const express = require("express");
const NotFoundError = require("./middleware/404Handling");
const ApiError = require("./utils/ApiError");
const app = express();
const morgan = require("morgan")
const cors = require('cors')

// Json parse
app.use(express.json())
app.use(cors())
app.use(morgan("dev"))

app.use("/api/v1", require("./router"))


app.get("/", (req, res) => {
    res.send({status: "ok"});
});

app.use("", (req, res, next) => {
    next(new ApiError(404, "Not Found"))
})

app.use(NotFoundError);

module.exports = app;