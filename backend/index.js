const express = require("express");

const { createServer } = require("http");

const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const { Server } = require("socket.io");

const httpServer = createServer(app);

const io = new Server(8001, {
  cors: true,
});

let room_members = [];

let socketAndPositions = new Map();

io.on("connection", (socket) => {
  console.log(socket.id);

  socket.on("hello", (position) => {
    //Only broadcasting to the room if the user is in the room.
    if (socketAndPositions.has(socket.id)) {
      socketAndPositions.set(socket.id, position);

      const myMap = Array.from(socketAndPositions.entries())

      socket.broadcast
        .to("collab")
        .emit(
          "change-position",
          myMap
        );
        // console.log(socketAndPositions)
    }
  });

  //letting the sockets join a room
  socket.on("join-room", (socketID) => {
    socket.join("collab");
    room_members.push(socket.id);
    socketAndPositions.set(socket.id, { ClientX: 0, ClientY: 0 });
    io.to("collab").emit(
      "New-User",
      "New User Connected " + socketID,
      room_members
    );
    console.log(room_members);
    console.log(socketAndPositions)
  });

  socket.on("disconnect", () => {
    room_members = room_members.filter((e) => e !== socket.id);
    // console.log(room_members);
    console.log(socketAndPositions)
    socketAndPositions.delete(socket.id);
  });
});

app.get("/", (req, res) => {
  res.json({ msg: "Hello " });
});

httpServer.listen(8000, () => {
  console.log("Started server on port 8000");
});
