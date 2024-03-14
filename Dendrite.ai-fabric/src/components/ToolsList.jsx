import React from "react";
import { LuRectangleHorizontal } from "react-icons/lu";
import { FaP, FaPencil } from "react-icons/fa6";

import { useBoard } from "../contexts/Board";

const ToolsList = () => {
  const { setTool, editor, items, setItems, tool } = useBoard();

  const onAddRectangle = () => {
    editor?.addRectangle();
    localStorage.setItem("items", JSON.stringify(editor?.canvas.toJSON()));
    setTool("rectangle")
  };

  const toggleDraw = () => {
    setTool("pencil")
  }

  return (
    <div className="bg-stone-800 absolute w-auto right-[4vw] h-[50vh] text-white rounded-3xl justify-center items-center flex flex-col">
      <button className=" m-1 ">
        <LuRectangleHorizontal
          onClick={onAddRectangle}
          className="h-10 my-6 w-10"
        />
        <FaPencil
          onClick={toggleDraw}
          className="h-8 w-8"
        />
      </button>
    </div>
  );
};

export default ToolsList;
