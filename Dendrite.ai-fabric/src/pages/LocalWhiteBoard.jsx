import React, { useCallback, useEffect, useState, useRef } from "react";
import { FabricJSCanvas } from "fabricjs-react";
import useMousePosition from "../hooks/useCursorHook";
import { useUser } from "../contexts/User";
import { useBoard } from "../contexts/Board";

import ToolsList from "../components/ToolsList";

const LocalWhiteBoard = () => {
  const { items, tool, setItems, setTool, editor, onReady } = useBoard();

  //   let log = useRef(true);

  //   Setting an intevalID, for the mousePosition to log, main purpose is to send position to the backend

  //   let mousePositionIntervalID = useRef(null);

  //   const position = useMousePosition();

  //   const { socket } = useUser();

  //   //logging the mouse position with intervals

  //   //don't start a new interval if already it has been set
  //   if (!mousePositionIntervalID.current) {
  //     //setting an interval to send position to the backend.
  //     mousePositionIntervalID.current = setInterval(
  //       () => (log.current = true),
  //       200
  //     );
  //   }

  //   useEffect(() => {
  //     if (log.current) {
  //       // console.log(position);
  //       socket.emit("hello", position);
  //       log.current = false;
  //     }
  //   }, [position]);

  //TODO:The history array should be either stored in localStorage, and also should be in a useRef as we don't want to empty it everytime we rerender the whiteboard.
  const history = [];

  let isWaiting = useRef(false);

  const undo = useCallback(() => {
    if (editor.canvas._objects.length > 0) {
      history.push(editor.canvas._objects.pop());
      localStorage.setItem("items", JSON.stringify(editor.canvas.toJSON()));
      console.log("item removed");
    }
    editor.canvas.renderAll();
  }, [editor]);

  const redo = useCallback(() => {
    if (history.length > 0) {
      editor.canvas.add(history.pop());
      localStorage.setItem("items", JSON.stringify(editor.canvas.toJSON()));
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
  const handleObjectOperations = useCallback(
    () => {
      //TODO: improve the undo redo functionality by developing a action based function that saves the action to the history stack on ctrlz and takes that action out of the history stack and does the effective redo, when ctrly is pressed.
      //console.log(e);

      localStorage.setItem("items", JSON.stringify(editor.canvas.toJSON()));
      // history.push(editor.canvas._objects.pop());
      setItems(editor.canvas.toJSON());
      console.log("item modified");
    },
    [editor]
  );

  useEffect(() => {
    editor?.canvas.on("object:added", handleObjectOperations);
    editor?.canvas.on("object:removed", handleObjectOperations);
    editor?.canvas.on("object:modified", handleObjectOperations);

    return () => {
      editor?.canvas.off("object:added", handleObjectOperations);
      editor?.canvas.off("object:removed", handleObjectOperations);
      editor?.canvas.off("object:modified", handleObjectOperations);
    };
  }, [editor, setItems]);

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
        </div>
      </div>
    </>
  );
};

export default LocalWhiteBoard;
