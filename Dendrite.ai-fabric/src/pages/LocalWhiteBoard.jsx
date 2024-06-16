import React, { useCallback, useEffect, useState, useRef } from "react";
import { FabricJSCanvas } from "fabricjs-react";
import useMousePosition from "../hooks/useCursorHook";
import { useUser } from "../contexts/User";
import { useBoard } from "../contexts/Board";

import ToolsList from "../components/ToolsList";
import { useHistory } from "@/hooks/useHistory";
import { useDebounce } from "@/hooks/useDebounceHook";

const LocalWhiteBoard = () => {
  const { items, tool, setItems, setTool, editor, onReady } = useBoard();

  //TODO:The history array should be either stored in localStorage, and also should be in a useRef as we don't want to empty it everytime we rerender the whiteboard.
  const [history, recoveryStack, isKeyDown] = useHistory();

  let isWaiting = useRef(false);

  const undo = useCallback(() => {
    if (history.current.length > 1) {
      isKeyDown.current = true;
      console.log(history.current.length);
      let task = history.current.pop();
      recoveryStack.current.push(task);
      editor?.canvas.loadFromJSON(
        JSON.parse(
          history.current[history.current.length - 1].canvas ||
            history.current[history.current.length]
        ),
        () => {
          editor.canvas.renderAll();
          isKeyDown.current = false;
        }
      );
    }
  }, [editor, history, recoveryStack, isKeyDown]);

  const redo = useCallback(() => {
    if (recoveryStack.current.length > 0) {
      isKeyDown.current = true;
      let recoveredTask = recoveryStack.current.pop();
      history.current.push(recoveredTask);
      editor?.canvas.loadFromJSON(JSON.parse(recoveredTask.canvas), () => {
        editor.canvas.renderAll();
        isKeyDown.current = false;
      });
    }
  }, [editor, history, recoveryStack, isKeyDown]);

  const debouncedRedo = useDebounce(redo, 50);
  const debouncedUndo = useDebounce(undo, 50);

  // Handling Keydown functions below, undo => Ctrl + z, redo => ctrl + y and other stuff

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
    [editor, history, recoveryStack, isKeyDown]
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
      <div className="w-full h-full my-7 flex flex-col md:flex md:flex-row justify-evenly gap-4 items-center">
        <div
          id="white-board"
          className="flex  relative justify-center items-center rounded-2xl w-[80vw] h-[90vh] overflow-hidden border-2"
        >
          <FabricJSCanvas
            className="sample-canvas h-full border-green-800 w-full cursor- bg-gray-50"
            onReady={onReady}
          />
        </div>
        <ToolsList />
      </div>
    </>
  );
};

export default LocalWhiteBoard;
