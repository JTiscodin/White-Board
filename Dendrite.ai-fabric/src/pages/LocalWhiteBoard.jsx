import React, { useCallback, useEffect, useState, useRef } from "react";
import { FabricJSCanvas } from "fabricjs-react";
import useMousePosition from "../hooks/useCursorHook";
import { useUser } from "../contexts/User";
import { useBoard } from "../contexts/Board";

import ToolsList from "../components/ToolsList";

const LocalWhiteBoard = () => {
  const { items, tool, setItems, setTool, editor, onReady } = useBoard();

  //TODO:The history array should be either stored in localStorage, and also should be in a useRef as we don't want to empty it everytime we rerender the whiteboard.
  const history = useRef([]);

  let isWaiting = useRef(false);

  const undo = useCallback(() => {
    if (editor?.canvas._objects.length > 0) {
      history.current.push(editor.canvas._objects.pop());
      localStorage.setItem("items", JSON.stringify(editor.canvas.toJSON()));
      console.log("item removed");
    }
    editor.canvas.renderAll();
  }, [editor, history]);

  const redo = useCallback(() => {
    if (history.current.length > 0) {
      editor.canvas.add(history.current.pop());
      localStorage.setItem("items", JSON.stringify(editor.canvas.toJSON()));
    }
  }, [editor, history]);

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
  const handleObjectOperations = useCallback(() => {
    //TODO: improve the undo redo functionality by developing a action based function that saves the action to the history stack on ctrlz and takes that action out of the history stack and does the effective redo, when ctrly is pressed.
    //console.log(e);

    localStorage.setItem("items", JSON.stringify(editor.canvas.toJSON()));
    console.log("item modified");
  }, [editor]);

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

  const handleZoom = useCallback(
    (e) => {
      if (!e.altKey) return;
      let zoom = editor?.canvas.getZoom();
      const delta = Math.sign(e.deltaY);
      const zoomFactor = 0.1;
      if (delta > 0) {
        editor?.canvas.setZoom((zoom -= zoomFactor));
      } else {
        editor?.canvas.setZoom((zoom += zoomFactor));
      }
    },
    [editor]
  );

  //Listening to various keydown events for enabling shortcuts
  useEffect(() => {
    const canvas = document.getElementById("white-board");
    document.addEventListener("keydown", handleKeyDown);

    canvas.addEventListener("wheel", handleZoom);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      canvas.removeEventListener("wheel", handleZoom);
    };
  }, [handleKeyDown, editor, handleZoom]);

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
            className="sample-canvas h-full border-green-800 w-full cursor- bg-gray-50"
            onReady={onReady}
          />
        </div>
      </div>
    </>
  );
};

export default LocalWhiteBoard;
