import { useEffect, useState } from "react";

const useMousePosition = () => {
  const [position, setPosition] = useState({
    clientX: 0,
    clientY: 0,
  });

  const updatePosition = (e) => {
    const { pageX, pageY, clientX, clientY } = e;

    setPosition({
      clientX,
      clientY,
    });
  };

  useEffect(() => {
    const canvas = document.getElementById("white-board")
    if(!canvas) return;

    canvas.addEventListener("mousemove", updatePosition, false);
    canvas.addEventListener("mouseenter", updatePosition, false);

    return () => {
        canvas.removeEventListener("mousemove", updatePosition);
        canvas.removeEventListener("mouseenter", updatePosition);
      }
  }, []);

  return position;
};

export default useMousePosition;
