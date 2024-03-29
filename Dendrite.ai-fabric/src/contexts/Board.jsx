import { createContext, useContext, useState } from "react";
import { useFabricJSEditor } from "fabricjs-react";

const BoardContext = createContext(null);

export const useBoard = () => {
  const context = useContext(BoardContext);
  return context;
};

const BoardContextProvider = ({ children }) => {
  const { editor, onReady } = useFabricJSEditor();
  const [items, setItems] = useState([]);
  const [tool, setTool] = useState("brush");
  return (
    <BoardContext.Provider
      value={{ items, tool, setItems, setTool, editor, onReady }}
    >
      {children}
    </BoardContext.Provider>
  );
};

export default BoardContextProvider;
