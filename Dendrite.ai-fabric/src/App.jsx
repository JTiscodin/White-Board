import React, { useState } from "react";

import WhiteBoard from "./components/WhiteBoard";

import "./App.css";
import BoardContextProvider from "./contexts/Board";
import UserContextProvider from "./contexts/User";

const App = () => {
  return (
    <div>
      <UserContextProvider>
        <BoardContextProvider>
          <WhiteBoard />
        </BoardContextProvider>
      </UserContextProvider>
    </div>
  );
};

export default App;
