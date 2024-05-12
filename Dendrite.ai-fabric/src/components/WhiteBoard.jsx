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
import { useBoard } from "../contexts/Board";

import ToolsList from "./ToolsList";

const WhiteBoard = () => {
  const { items, tool, setItems, setTool, editor, onReady } = useBoard();

  let log = useRef(true);

  // Setting an intevalID, for the mousePosition to log, main purpose is to send position to the backend
  let mousePositionIntervalID = useRef(null);

  const position = useMousePosition();

  const { socket } = useUser();

  //logging the mouse position with intervals

  //don't start a new interval if already it has been set
  if (!mousePositionIntervalID.current) {
    //setting an interval to send position to the backend.
    mousePositionIntervalID.current = setInterval(
      () => (log.current = true),
      200
    );
  }

  socket.on("connect", () => {
    //logging the socket.id
    console.log(socket.id);
  });

  useEffect(() => {
    if (log.current) {
      console.log(position);
      // socket.emit("hello", position)
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
          localStorage.setItem("items", JSON.stringify(editor.canvas.toJSON()));
          setItems(editor.canvas.toJSON());
        }
      }
    },
    [undo, redo, editor, setItems]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (tool === "pencil") {
      editor.canvas.isDrawingMode = true;
    } else {
      if (editor) {
        editor.canvas.isDrawingMode = false;
      }
    }
    console.log(tool);
  }, [tool, setTool]);

  useEffect(() => {
    const savedState = localStorage.getItem("items");
    if (savedState && editor) {
      editor.canvas.loadFromJSON(JSON.parse(savedState), () => {
        editor.canvas.renderAll();
        setItems(editor.canvas.toJSON());
      });
    }
  }, [editor, setItems]);

  const onAddCircle = () => {
    editor?.addCircle();
    localStorage.setItem("items", JSON.stringify(editor?.canvas.toJSON()));
    setItems(editor.canvas.toJSON());
  };

  //connecting to a room
  const connect = () => {
    socket.emit("join-room", socket.id);
  };

  useEffect(() => {
    const handleNewUser = (msg) => {
      console.log(msg);
    }

    socket.on("New-User", handleNewUser);

    return () => {
      socket.off("New-User", handleNewUser)
    }
  },[socket]);

  return (
    <>
      <button
        onClick={connect}
        className="bg-black text-white p-2 rounded-3xl m-7"
      >
        Connect to the room
      </button>
      <div className="w-full h-full my-7 flex justify-center items-center">
        <ToolsList />
        <div
          id="white-board"
          className="flex justify-center items-center rounded-2xl w-[80vw] h-[90vh] overflow-hidden border-2"
        >
          <FabricJSCanvas
            className="sample-canvas h-full border-green-800 w-full cursor-crosshair bg-gray-50"
            onReady={onReady}
          />
        </div>
      </div>
    </>
  );
};

export default WhiteBoard;
