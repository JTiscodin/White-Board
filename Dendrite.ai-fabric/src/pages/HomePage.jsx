import React from "react";
import { Button } from "../components/ui/button";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
    const navigate = useNavigate();

    const redirectToPersonalBoard = () => {
        navigate("/draw")
    }

    const redirectToCollaborativeBoard = () => {
        navigate("/collab")
    }

  return (
    <>
      <div className="h-screen w-full flex flex-col gap-7 justify-center items-center">
        <Button onClick={redirectToCollaborativeBoard}>Start a Collaborative Whiteboard</Button>
        <Button onClick = {redirectToPersonalBoard}>Personal White Board</Button>
      </div>
    </>
  );
};

export default HomePage;
