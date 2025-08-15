const express = require("express");
const NotFoundError = require("./middleware/404Handling");
const ApiError = require("./utils/ApiError");
const app = express();

app.use("/api/v1", require("./router"))


app.get("/", (req, res) => {
    res.send({status: "ok"});
});

app.use("", (req, res, next) => {
    next(new ApiError(404, "Not Found"))
})

app.use(NotFoundError);

module.exports = app;