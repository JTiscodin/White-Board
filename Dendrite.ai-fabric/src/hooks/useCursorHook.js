import { useCallback, useEffect, useState } from "react";
import { useBoard } from "../contexts/Board";

const useMousePosition = () => {
  const [position, setPosition] = useState({
    clientX: 0,
    clientY: 0,
  });

  const { editor } = useBoard();

  const handleMouseMove = useCallback((e) => {
    let clientX = e.absolutePointer.x;
    let clientY = e.absolutePointer.y;
    setPosition({
      clientX,
      clientY,
    });
  }, []);

  useEffect(() => {
    editor?.canvas.on("mouse:move", handleMouseMove);
  }, [editor,handleMouseMove]);

  return position;
};

export default useMousePosition;
