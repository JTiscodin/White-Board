import { useEffect, useState } from "react";
import { useBoard } from "../contexts/Board";

const useMousePosition = () => {
  const [position, setPosition] = useState({
    clientX: 0,
    clientY: 0,
  });

  const { editor } = useBoard();

  const updatePosition = (e) => {
    const { pageX, pageY, clientX, clientY } = e;

    setPosition({
      clientX,
      clientY,
    });
  };

  const handleMouseMove = (e) => {
    let clientX = e.absolutePointer.x;
    let clientY = e.absolutePointer.y;
    setPosition({
      clientX,
      clientY,
    });
    console.log(e.absolutePointer);
  };

  useEffect(() => {
    const canvas = document.getElementById("white-board");
    if (!canvas) return;

    // canvas.addEventListener("mousemove", updatePosition, false);
    editor?.canvas.on("mouse:move", handleMouseMove);

    return () => {
      canvas.removeEventListener("mousemove", updatePosition);
      canvas.removeEventListener("mouseenter", updatePosition);
    };
  }, [editor]);

  return position;
};

export default useMousePosition;
