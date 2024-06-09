const express = require("express");

const { createServer } = require("http");

const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const { Server } = require("socket.io");

const httpServer = createServer(app);

const io = new Server(8001, {
  cors: true,
});

let rooms = [];

let room_members = [];

let socketAndPositions = new Map();

const colors = [
  "#FF5733", // Vibrant Red-Orange
  "#33FF57", // Bright Green
  "#3357FF", // Vivid Blue
  "#FF33A1", // Hot Pink
  "#FF9133", // Orange
  "#33FFF2", // Turquoise
  "#A133FF", // Purple
  "#FF33C1", // Magenta
  "#FF5733", // Coral
  "#33D1FF", // Sky Blue
];

const getRandomColor = () => {
  const randomIndex = Math.floor(Math.random() * colors.length);
  return colors[randomIndex];
};

const createRoom = (roomName) => {
  let room = {
    id: uuidv4(),
    name: roomName,
    canvas: {},
    room_members: [],
    socketAndPositions: new Map(),
  };
  rooms.push(room);

  return room;
};

io.on("connection", (socket) => {
  console.log("Socket connected " + socket.id);

  socket.on("change-in-canvas", (canvas, roomId, socketId) => {
    rooms.forEach((room) => {
      if (room.id === roomId && room.canvas !== canvas) {
        room.canvas = canvas;
        socket.broadcast.to(room.id).emit(
          "updated-canvas",
          JSON.stringify({
            ...room,
            socketAndPositions: Array.from(room.socketAndPositions.entries),
          }),
          socketId
        );
        return;
      }
    });
  });

  socket.on("mouse-position-change", (position, roomId) => {
    //finding the room and changing the socket positions
    rooms.forEach((room) => {
      //Only broadcasting to the room if the user is in the room.

      if (room.id === roomId) {
        if (room.socketAndPositions.has(socket.id)) {
          let existingSocket = room.socketAndPositions.get(socket.id);

          //we need to keep the colour intact, so we only change the positions, not the colour that was set during joining room.
          room.socketAndPositions.set(socket.id, {
            ...existingSocket,
            ...position,
          });

          socket.broadcast.to(roomId).emit(
            "change-position",
            JSON.stringify({
              ...room,
              socketAndPositions: Array.from(room.socketAndPositions.entries()),
            })
          );
        }
      }
    });

    // if (socketAndPositions.has(socket.id)) {
    //   let existingSocket = socketAndPositions.get(socket.id);
    //   socketAndPositions.set(socket.id, { ...existingSocket, ...position });

    //   //Converting the Map to a tranferable format, we need to send it to frontend everytime a user is moves the cursor.
    //   const myMap = Array.from(socketAndPositions.entries());
    // }
  });

  //letting the sockets join a room
  socket.on("join-room", (roomId) => {
    rooms.forEach((room) => {
      if (room.id === roomId) {
        if (!room.room_members.includes(socket.id))
          room.room_members.push(socket.id);
        socket.join(roomId);

        room.socketAndPositions.set(socket.id, {
          clientX: 0,
          clientY: 0,
          colour: getRandomColor(),
        });

        socket.broadcast
          .to(roomId)
          .emit(
            "New-User",
            "New User Connected " + socket.id,
            JSON.stringify(room)
          );
        return;
      }
    });
  });

  socket.on("leave-room", (roomId) => {
    rooms.forEach((room) => {
      if (room.id === roomId) {
        if (room.room_members.includes(socket.id)) {
          room.room_members = room.room_members.filter(
            (member) => member !== socket.id
          );

          room.socketAndPositions.delete(socket.id);

          socket.leave(room.id);

          io.to(room.id).emit(
            "User-left",
            socket.id,
            JSON.stringify({
              ...room,
              socketAndPositions: Array.from(room.socketAndPositions.entries()),
            })
          );
          return;
        }
      }
    });
  });

  //Special Disconnecting event
  socket.on("disconnecting", () => {
    //Removing the user from the specified room.

    let socket_rooms = Array.from(socket.rooms, (value) => value);
    if (!!socket_rooms[1]) {
      rooms.forEach((room) => {
        if (room.id === socket_rooms[1]) {
          room.room_members = room.room_members.filter(
            (member) => member !== socket.id
          );
          socket.leave(room.id);

          io.to(room.id).emit(
            "User-disconnected",
            socket.id,
            JSON.stringify({
              ...room,
              socketAndPositions: Array.from(room.socketAndPositions.entries()),
            })
          );
          return;
        }
      });
    }
  });

  //Handle the disconnection logic here.
  socket.on("disconnect", () => {
    console.log("disconnected " + socket.id);
    room_members = room_members.filter((e) => e !== socket.id);
    socketAndPositions.delete(socket.id);
  });
});

app.get("/", (req, res) => {
  res.json({ msg: "Hello " });
});

app.post("/create-room", async (req, res) => {
  const { roomName } = req.body;
  const room = await createRoom(roomName);

  res.send({ room });
});

app.get("/activeRooms", (req, res) => {
  res.json({ rooms });
});

app.get("/getRoom/:roomId", (req, res) => {
  const { roomId } = req.params;
  const room = rooms.find((room) => room.id === roomId);
  res.json(
    JSON.stringify({
      ...room,
      socketAndPositions: Array.from(room.socketAndPositions.entries()),
    })
  );
});

httpServer.listen(8000, () => {
  console.log("Started server on port 8000");
});
