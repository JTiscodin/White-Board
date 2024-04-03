const express = require("express");

const { createServer } = require("http");

const app = express();

const { Server } = require("socket.io");

const httpServer = createServer(app);

const io = new Server();

io.on("connection", (socket) => {});

app.get("/", (req, res) => {
  res.json({ msg: "Hello " });
});

io.listen(8001);

app.listen(8000, () => {
  console.log("Started server on port 8000");
});
