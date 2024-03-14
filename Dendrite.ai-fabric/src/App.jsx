import React, { useState } from "react";

import WhiteBoard from "./components/WhiteBoard";

import "./App.css";
import BoardContextProvider from "./contexts/Board";

const App = () => {
  return (
    <div>
      <BoardContextProvider>
        <WhiteBoard />
      </BoardContextProvider>
    </div>
  );
};

export default App;
