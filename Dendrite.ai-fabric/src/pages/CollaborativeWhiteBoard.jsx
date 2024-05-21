import React, {
  useCallback,
  useEffect,
  useState,
  useRef,
  useMemo,
} from "react";
import { FabricJSCanvas, useFabricJSEditor } from "fabricjs-react";
import useMousePosition from "../hooks/useCursorHook";
import { useUser } from "../contexts/User";
import { useParams } from "react-router-dom";
import { useBoard } from "../contexts/Board";

import ToolsList from "../components/ToolsList";

import { CiLocationArrow1 } from "react-icons/ci";

const CollaborativeWhiteBoard = () => {
  const { items, tool, setItems, setTool, editor, onReady } = useBoard();

  let log = useRef(true);

  let { roomId } = useParams();

  let [room, setRoom] = useState({});

  //Getting room details from roomID

  // Setting an intevalID, for the mousePosition to log, main purpose is to send position to the backend
  let mousePositionIntervalID = useRef(null);

  const position = useMousePosition();

  const { socket } = useUser();

  const [connected, setConnected] = useState(false);

  const [users, setUsers] = useState([]);

  const isUpdatingRef = useRef(false);

  //connecting to a room
  const connect = useCallback(
    async (roomId) => {
      await socket.emit("join-room", roomId);
      setConnected(true);
    },
    [socket]
  );

  const getRoomWithRoomId = useCallback(
    async (roomId) => {
      let response = await fetch(`http://localhost:8000/getRoom/${roomId}`);

      let room = await response.json();

      console.log(JSON.parse(room).canvas);

      await editor?.canvas.loadFromJSON(JSON.parse(room).canvas, () => {
        editor.canvas.renderAll();
      });

      setRoom(room.room);

      await connect(roomId);
    },
    [editor, connect]
  );

  useEffect(() => {
    getRoomWithRoomId(roomId);
    const onUnload = () => {
      return socket.emit("leave-room", roomId);
    };
    window.addEventListener("beforeunload", onUnload);

    return () => {
      // window.removeEventListener("beforeunload", onUnload);
      socket.emit("leave-room", roomId);
    };
  }, [socket, getRoomWithRoomId, roomId]);

  //logging the mouse position with intervals

  //don't start a new interval if already it has been set
  if (!mousePositionIntervalID.current) {
    //setting an interval to send position to the backend.
    mousePositionIntervalID.current = setInterval(
      () => (log.current = true),
      200
    );
  }

  useEffect(() => {
    const handleConnect = () => {
      console.log(socket.id);
    };

    const handleDisconnect = () => {
      setConnected(false);
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
    };
  }, [socket]);

  useEffect(() => {
    if (log.current) {
      // console.log(position);
      socket.emit("mouse-position-change", position, roomId);
      log.current = false;
    }
  }, [position]);

  const history = [];
  let isWaiting = useRef(false);

  const undo = useCallback(() => {
    if (editor.canvas._objects.length > 0) {
      history.push(editor.canvas._objects.pop());
    }
    editor.canvas.renderAll();
  }, [editor]);

  const redo = useCallback(() => {
    if (history.length > 0) {
      editor.canvas.add(history.pop());
    }
  }, [editor]);

  // Handling Keydown functions below, undo => Ctrl + z, redo => ctrl + y and other stuff

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "z" && e.ctrlKey && !isWaiting.current) {
        isWaiting.current = true;
        setTimeout(() => {
          isWaiting.current = false;
        }, 200);
        undo();
      } else if (e.key === "y" && e.ctrlKey && !isWaiting.current) {
        isWaiting.current = true;
        setTimeout(() => {
          isWaiting.current = false;
        }, 200);
        redo();
      } else if (e.key === "Delete" && editor) {
        const activeObject = editor.canvas.getActiveObject();
        if (activeObject) {
          editor?.deleteSelected();
        }
      }
    },
    [undo, redo, editor]
  );

  //A canvas method to directly do something, whenver any object is added/removed/modified to canvas, save the canvas to the local storage.
  const handleObjectOperations = useCallback(async () => {
    if(isUpdatingRef.current){
      console.log("kisi aur ne badla")
      return
    }
    const newCanvas = editor.canvas.toJSON();

    const isCanvasChanged =
      JSON.stringify(newCanvas) !== JSON.stringify(room.canvas);
    if (isCanvasChanged) {
      await socket.emit("change-in-canvas", newCanvas, roomId);
      console.log("request bheji");
      setRoom((prev) => {
        return { ...prev, canvas: JSON.stringify(newCanvas) };
      });
      // localStorage.setItem("items", JSON.stringify(editor?.canvas.toJSON()));
    }
  }, [editor, roomId, socket, isUpdatingRef]);

  useEffect(() => {
    editor?.canvas.on("object:added", handleObjectOperations);
    editor?.canvas.on("object:removed", handleObjectOperations);
    editor?.canvas.on("object:modified", handleObjectOperations);

    return () => {
      editor?.canvas.off("object:added", handleObjectOperations);
      editor?.canvas.off("object:removed", handleObjectOperations);
      editor?.canvas.off("object:modified", handleObjectOperations);
    };
  }, [editor, setItems, handleObjectOperations]);

  //Listening to various keydown events for enabling shortcuts
  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  useEffect(() => {
    if (tool === "pencil" && editor) {
      editor.canvas.isDrawingMode = true;
    } else {
      if (editor) {
        editor.canvas.isDrawingMode = false;
      }
    }
    console.log(tool);
  }, [tool, setTool, editor]);

  useEffect(() => {
    const savedState = localStorage.getItem(roomId);
    if (savedState && editor) {
      editor.canvas.loadFromJSON(JSON.parse(savedState), () => {
        editor.canvas.renderAll();
        setItems(editor.canvas.toJSON());
      });
    }
  }, [editor, setItems, roomId]);

  const handleNewUser = useCallback((msg, room) => {
    console.log(msg);
  }, []);

  const handlePositionChange = useCallback(
    async (room) => {
      let changedRoom = JSON.parse(room);
      setRoom(changedRoom);
      let finalUsers = changedRoom.socketAndPositions.filter(
        (user) => user[0] !== socket.id
      );
      setUsers(finalUsers);
    },
    [socket.id]
  );

  const handleUserDisconnection = useCallback((socketID, room) => {
    console.log("User disconnected " + socketID);
    setRoom(room);
    let finalUsers = room.socketAndPositions.filter(
      (user) => user[0] !== socket.id
    );
    setUsers(finalUsers);
  }, []);

  const handleUserLeft = useCallback(
    async (user, room) => {
      console.log(user + " left the room");
      let changedRoom = JSON.parse(room);
      setRoom(changedRoom);
      let finalUsers = changedRoom.socketAndPositions.filter(
        (user) => user[0] !== socket.id
      );
      setUsers(finalUsers);
    },
    [socket.id]
  );

  const handleCanvasUpdation = useCallback(
    async (room, socketId) => {
      // if (isUpdatingRef.current) return; // Skip if an update is already being processed
      // isUpdatingRef.current = true; // Set the isUpdating flag

      // try {
      //   let finalRoom = await JSON.parse(room);
      //   const isCanvasChanged = JSON.stringify(finalRoom.canvas) !== JSON.stringify(editor.canvas);

      //   if (isCanvasChanged) {
      //     await editor?.canvas.loadFromJSON(finalRoom.canvas, async () => {
      //       await editor.canvas.renderAll();
      //       console.log("canvas changed");
      //     });
      //   }
      // } finally {
      //   isUpdatingRef.current = false; // Reset the isUpdating flag
      // }

      if (socket.id !== socketId) {
        let finalRoom = await JSON.parse(room);
        isUpdatingRef.current = true;
        await editor?.canvas.loadFromJSON(finalRoom.canvas, () => {
          editor.canvas.renderAll();
          console.log("canvas changed");
        });

        isUpdatingRef.current = false;
        console.log("ha change karna chaiye ");
      }
    },
    [editor]
  );

  useEffect(() => {
    //When a new user connects to the room
    socket.on("New-User", handleNewUser);

    //When position of any other user in the room changes
    socket.on("change-position", handlePositionChange);

    socket.on("User-disconnected", handleUserDisconnection);

    socket.on("User-left", handleUserLeft);

    socket.on("updated-canvas", handleCanvasUpdation);

    return () => {
      socket.off("New-User", handleNewUser);
      socket.off("change-position", handlePositionChange);
      socket.off("User-left", handleUserLeft);
      socket.off("updated-canvas", handleCanvasUpdation);
    };
  }, [
    socket,
    handleNewUser,
    handlePositionChange,
    handleUserLeft,
    handleUserDisconnection,
    handleCanvasUpdation,
  ]);

  return (
    <>
      <div className="w-full h-full my-7 flex justify-center items-center">
        <ToolsList />
        <div
          id="white-board"
          className="flex  relative justify-center items-center rounded-2xl w-[80vw] h-[90vh] overflow-hidden border-2"
        >
          <FabricJSCanvas
            className="sample-canvas h-full border-green-800 w-full cursor-crosshair bg-gray-50"
            onReady={onReady}
          />
          {/* //setting up multiple cursors  */}
          {users.map((user) => (
            <div
              key={user[0]} // Assuming `user` has a `socketId` property
              className={`absolute transition-position duration-100 w-7 h-7 pointer-events-none`}
              style={{
                left: `${user[1].clientX}px`,
                top: `${user[1].clientY}px`,
                color: user[1].colour,
              }}
            >
              <CiLocationArrow1 className="text-xl" />
              <span className="font-bold">{user[0]}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default CollaborativeWhiteBoard;
