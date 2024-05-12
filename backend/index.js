const express = require("express");

const { createServer } = require("http");

const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const { Server } = require("socket.io");
const exp = require("constants");

const httpServer = createServer(app);

const io = new Server(8001, {
  cors: true,
});

io.on("connection", (socket) => {
  console.log(socket.id);
  socket.on("hello", (position) => {
    io.to("collab")
    console.log(position)
  })

  //letting the sockets join a room
  socket.on("join-room", (socketID) => {
    socket.join("collab")
    io.to("collab").emit("New-User", "New User Connected " + socketID)
  })


});


app.get("/", (req, res) => {
  res.json({ msg: "Hello " });
});

app.listen(8000, () => {
  console.log("Started server on port 8000");
});
