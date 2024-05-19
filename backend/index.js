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
    canvas: "",
    room_members: [],
    socketAndPositions: new Map(),
  };
  rooms.push(room);

  return room;
};

io.on("connection", (socket) => {
  console.log(socket.id);

  socket.on("hello", (position) => {
    //Only broadcasting to the room if the user is in the room.
    if (socketAndPositions.has(socket.id)) {
      //we need to keep the colour intact, so we only change the positions, not the colour that was set during joining room.
      let existingSocket = socketAndPositions.get(socket.id);
      socketAndPositions.set(socket.id, { ...existingSocket, ...position });

      //Converting the Map to a tranferable format, we need to send it to frontend everytime a user is moves the cursor.
      const myMap = Array.from(socketAndPositions.entries());
      socket.broadcast.to("collab").emit("change-position", myMap);
    }
  });

  //letting the sockets join a room
  socket.on("join-room", (roomId) => {

    console.log(roomId)

    // socket.join(roomId);
    let targetRoom = rooms.find((room) => room.id === roomId)

    // console.log(targetRoom)

    // targetRoom.room_members.push(socket.id);

    // rooms.forEach((room,i) => {})

    socketAndPositions.set(socket.id, {
      ClientX: 0,
      ClientY: 0,
      colour: getRandomColor(),
    });
    io.to("collab").emit(
      "New-User",
      "New User Connected " + socket.id,
      room_members
    );
  });

  socket.on("disconnect", () => {
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
  res.json({ room });
});

httpServer.listen(8000, () => {
  console.log("Started server on port 8000");
});
