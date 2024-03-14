import React, { useCallback, useEffect, useState } from "react";
import { FabricJSCanvas, useFabricJSEditor } from "fabricjs-react";
import { useBoard } from "../contexts/Board";
import ToolsList from "./ToolsList";

const WhiteBoard = () => {
  const { items, tool, setItems, setTool, editor, onReady } = useBoard();

  const handleKeyDown = (e) => {
    if (e.key === "f" && editor) {
      console.log("pressed")
      const test = editor.zoomIn()
    }
    if (e.key === "Delete" && editor) {
      const activeObject = editor.canvas.getActiveObject();
      if (activeObject) {
        editor?.deleteSelected()
        localStorage.setItem("items", JSON.stringify(editor.canvas.toJSON()));
        setItems(editor.canvas.toJSON());
      }
    }
  };

  document.addEventListener("keydown", handleKeyDown);

  useEffect(() => {
    if (tool === "pencil") {
      editor.canvas.isDrawingMode = true
      console.log(editor.canvas.isDrawingMode)
    } else {
      if (editor) {
        editor.canvas.isDrawingMode = false
      }
    }

  }, [tool, setTool])

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

  return (
    <div className="w-full h-full my-7 flex justify-center items-center">
      <ToolsList />
      <div className="flex justify-center items-center rounded-2xl w-[80vw] h-[90vh] overflow-hidden border-2">
        <FabricJSCanvas
          className="sample-canvas h-full border-green-800 w-full cursor-crosshair bg-gray-50"
          onReady={onReady}
        />
      </div>
    </div>
  );
};

export default WhiteBoard;
