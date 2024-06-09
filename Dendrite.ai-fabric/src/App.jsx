import React, { useState } from "react";

import WhiteBoard from "./components/WhiteBoard";

import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import BoardContextProvider from "./contexts/Board";
import UserContextProvider from "./contexts/User";
import HomePage from "./pages/HomePage";
import LocalWhiteBoard from "./pages/LocalWhiteBoard";
import CollaborativeWhiteBoard from "./pages/CollaborativeWhiteBoard";
import CreateRoom from "./pages/CreateRoom";

const App = () => {
  return (
    <UserContextProvider>
      <BoardContextProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/draw" element={<LocalWhiteBoard />} />
            <Route path="/" element={<HomePage />} />
            <Route path="/test" element={<WhiteBoard />} />
            <Route path="/collab/:roomId" element={<CollaborativeWhiteBoard />} />
            <Route path="/create-room" element={<CreateRoom />} />
          </Routes>
        </BrowserRouter>
      </BoardContextProvider>
    </UserContextProvider>
  );
};

export default App;
