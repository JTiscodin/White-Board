import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const CreateRoom = () => {
  const [roomName, setRoomName] = useState("");
  const [activeRooms, setActiveRooms] = useState([]);
  const navigate = useNavigate();

  const getRooms = async () => {
    let result = await fetch("http://localhost:8000/activeRooms");

    let rooms = await result.json();

    console.log(rooms.rooms);

    setActiveRooms(rooms.rooms);
  };

  useEffect(() => {
    getRooms();
  }, []);

  const createRoom = async (e) => {
    e.preventDefault();
    const response = await fetch("http://localhost:8000/create-room", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ roomName }),
    });

    let room = await response.json()

    console.log(room.room.id)

    if(response.ok){
        navigate(`/collab/${room.room.id}`)
    }
  };

  return (
    <div className="h-screen w-full flex flex-col justify-center items-center">
      <form onSubmit={createRoom} className="flex flex-col gap-9 w-[30vw]">
        <Label className="text-2xl">
          Enter Room name:
          <Input
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            className="m-2 border-2 shadow-lg"
            placeholder="Room name"
          />
        </Label>
        <Button className="w-[20vw] self-center shadow-lg active:scale-95">
          Create Room
        </Button>
      </form>
      <div>
        <h1 className="text-3xl mt-10">Currently available rooms:</h1>
        {activeRooms.map((room) => {
          return (
            <div key={room.id} className="cursor-pointer m-2">
              <h1 className="text-xl bg-zinc-800 font-bold text-slate-400 text-center rounded-lg hover:scale-110 duration-100 p-6">{room.name}</h1>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CreateRoom;
