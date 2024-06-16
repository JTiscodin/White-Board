import React, { useEffect } from "react";
import { LuRectangleHorizontal } from "react-icons/lu";
import { FaP, FaPencil, FaArrowPointer } from "react-icons/fa6";
import { MdOutlineTextFields } from "react-icons/md";
import { useBoard } from "../contexts/Board";

const ToolsList = () => {
  const { setTool, editor, items, setItems, tool } = useBoard();

  // useEffect(() => {
  //   if (editor?.canvas) {
  //     switch (tool) {
  //       case "rectangle":
  //         editor.canvas.defaultCursor = "crosshair";
  //         break;
  //       case "pencil":
  //         editor.canvas.defaultCursor = "default"; // or any other cursor you prefer
  //         break;
  //       default:
  //         editor.canvas.defaultCursor = "default";
  //         break;
  //     }
  //   }
  // }, [tool, editor]);

  const onAddRectangle = () => {
    editor?.addRectangle();
    setTool("rectangle");
    console.log("Tool changed to rectangle");
  };

  const onAddCircle = () => {
    editor?.addCircle();
    localStorage.setItem("items", JSON.stringify(editor?.canvas.toJSON()));
    setItems(editor.canvas.toJSON());
  };

  const toggleDraw = () => {
    setTool("pencil");
    console.log("set tool to pencil");
  };

  const addText = () => {
    editor?.addText("text")
    setTool("default")
  }

  return (
    <div className="bg-stone-800  text-white rounded-3xl flex md:flex md:flex-col gap-10 justify-around items-center ">
      <button className="m-3" onClick={onAddRectangle}>
        <LuRectangleHorizontal className="h-10 w-10 p-1  hover:bg-purple-400 duration-200 rounded-2xl" />
      </button>
      <button className="m-3" onClick={toggleDraw}>
        <FaPencil className="h-8 w-8 p-1  hover:bg-purple-400 duration-200 rounded-2xl" />
      </button>
      <button className="m-3" onClick={() => setTool("default")}>
        <FaArrowPointer className="h-7 w-7 p-1  hover:bg-purple-400 duration-200 rounded-2xl" />
      </button>
      <button className="m-3" onClick={addText}>
        <MdOutlineTextFields className="h-7 w-7 p-1  hover:bg-purple-400 duration-200 rounded-2xl" />
      </button>
    </div>
  );
};

export default ToolsList;
