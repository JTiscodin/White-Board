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
import { useDebounce } from "@/hooks/useDebounceHook";
import { CiLocationArrow1 } from "react-icons/ci";
import { useHistory } from "@/hooks/useHistory";

const WhiteBoard = () => {
  const { items, tool, setItems, setTool, editor, onReady } = useBoard();

  let log = useRef(true);

  // Setting an intevalID, for the mousePosition to log, main purpose is to send position to the backend
  let mousePositionIntervalID = useRef(null);

  const position = useMousePosition();

  // const { socket } = useUser();

  

  const [users, setUsers] = useState([]);

  const [history, recoveryStack] = useHistory()

  const isKeyDown = useRef(false);

  //logging the mouse position with intervals

  //don't start a new interval if already it has been set
  if (!mousePositionIntervalID.current) {
    //setting an interval to send position to the backend.
    mousePositionIntervalID.current = setInterval(
      () => (log.current = true),
      200
    );
  }

  let isWaiting = useRef(false);

  const undo = useCallback(() => {
    if (history.current.length > 1) {
      isKeyDown.current = true;
      console.log(history.current.length);
      let task = history.current.pop();
      recoveryStack.current.push(task);
      editor?.canvas.loadFromJSON(
        JSON.parse(history.current[history.current.length - 1].canvas || history.current[history.current.length]),
        () => {
          editor.canvas.renderAll();
          isKeyDown.current = false;
        }
      );
    }
  }, [editor, history,recoveryStack]);

  const redo = useCallback(() => {
    if (recoveryStack.current.length > 0) {
      isKeyDown.current = true
      let recoveredTask = recoveryStack.current.pop()
      history.current.push(recoveredTask)
      editor?.canvas.loadFromJSON(
        JSON.parse(recoveredTask.canvas), () => {
          editor.canvas.renderAll()
          isKeyDown.current=false
        }
      )
    }
  }, [editor, history, recoveryStack]);

  // Handling Keydown functions below, undo => Ctrl + z, redo => ctrl + y and other stuff

  let debouncedUndo = useDebounce(undo, 50);
  let debouncedRedo = useDebounce(redo, 50);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "z" && e.ctrlKey && !isWaiting.current) {
        debouncedUndo();
      } else if (e.key === "y" && e.ctrlKey && !isWaiting.current) {
        debouncedRedo();
      } else if (e.key === "Delete" && editor) {
        const activeObject = editor.canvas.getActiveObject();
        if (activeObject) {
          editor?.deleteSelected();
        }
      }
    },
    [editor, debouncedRedo, debouncedUndo]
  );

  //A canvas method to directly do something, whenver any object is added/removed/modified to canvas, save the canvas to the local storage.
  const handleObjectOperations = useCallback(
    (e, msg) => {
      if (!isKeyDown.current) {
        // Check flag
        const newState = {
          action: msg || e.action,
          canvas: JSON.stringify(editor.canvas.toJSON()),
        };
        history.current.push(newState);
        console.log("Did push");
        recoveryStack.current = []; // Clear the redo stack
      } else {
        console.log("Didn't pushed");
      }

      console.log(history.current);

      localStorage.setItem("items", JSON.stringify(editor.canvas.toJSON()));
      // setItems(editor.canvas.toJSON());
    },
    [editor, history, recoveryStack]
  );

  useEffect(() => {
    editor?.canvas.on("object:added", (e) => handleObjectOperations(e, "add"));
    editor?.canvas.on("object:removed", (e) =>
      handleObjectOperations(e, "deleted")
    );
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
    if (tool === "pencil") {
      editor.canvas.isDrawingMode = true;
    } else {
      if (editor) {
        editor.canvas.isDrawingMode = false;
      }
    }
    console.log(tool);
  }, [tool, setTool, editor]);

  useEffect(() => {
    const savedState = localStorage.getItem("items");
    if (savedState && editor) {
      editor.canvas.loadFromJSON(JSON.parse(savedState), () => {
        editor.canvas.renderAll();
        setItems(editor.canvas.toJSON());
      });
    }
  }, [editor, setItems]);

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

export default WhiteBoard;
