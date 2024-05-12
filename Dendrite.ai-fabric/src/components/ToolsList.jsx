import React, {useEffect} from "react";
import { LuRectangleHorizontal } from "react-icons/lu";
import { FaP, FaPencil } from "react-icons/fa6";

import { useBoard } from "../contexts/Board";

const ToolsList = () => {
  const { setTool, editor, items, setItems, tool } = useBoard();

  useEffect(() => {
    if (editor?.canvas) {
      switch (tool) {
        case "rectangle":
          editor.canvas.defaultCursor = "crosshair";
          break;
        case "pencil":
          editor.canvas.defaultCursor = "default"; // or any other cursor you prefer
          break;
        default:
          editor.canvas.defaultCursor = "default";
          break;
      }
    }
  }, [tool, editor]);

  const onAddRectangle = () => {
    editor?.addRectangle();
    //TODO: change the cursor to draw 
    localStorage.setItem("items", JSON.stringify(editor?.canvas.toJSON()));
    setTool("rectangle");
    console.log("Tool changed to rectangle");
  };

  const toggleDraw = () => {
    setTool("pencil");
    console.log("set tool to pencil");
  };

  return (
    <div className="bg-stone-800 absolute w-auto right-[4vw] h-[50vh] text-white rounded-3xl justify-center items-center flex flex-col">
      <button className=" m-1 " onClick={onAddRectangle}>
        <LuRectangleHorizontal className="h-10 my-6 w-10" />
      </button>
      <button className="m-1" onClick={toggleDraw}>
        <FaPencil className="h-8 w-8" />
      </button>
      <button onClick={() => setTool("default")}>Default</button>
    </div>
  );
};

export default ToolsList;
