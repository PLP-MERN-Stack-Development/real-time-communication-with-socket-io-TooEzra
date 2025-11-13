import { useState, useEffect } from "react";
import { getSocket } from "../services/socket";

interface Props {
  currentRoom: string;
  onSelectRoom: (room: string) => void;
}

export default function RoomList({ currentRoom, onSelectRoom }: Props) {
  const [rooms, setRooms] = useState<string[]>(["global"]);
  const [newRoom, setNewRoom] = useState("");
  const socket = getSocket();

  // Fetch room list from server via Socket.io
  useEffect(() => {
    if (!socket) return;

    const handleRooms = (roomList: string[]) => {
      setRooms(["global", ...roomList]);
    };

    // Request current rooms
    socket.emit("getRooms");
    socket.on("rooms", handleRooms);

    // Listen for real-time updates (e.g., new room created)
    return () => {
      socket.off("rooms", handleRooms);
    };
  }, [socket]);

  const createRoom = () => {
    const trimmed = newRoom.trim();
    if (!trimmed || rooms.includes(trimmed)) return;

    // Tell server to create room
    socket?.emit("createRoom", trimmed);

    setNewRoom("");
  };

  return (
    <div className="w-64 bg-gray-50 border-r p-4 flex flex-col h-full">
      <h3 className="font-bold text-lg mb-4 text-gray-800">Rooms</h3>

      {/* Room List */}
      <div className="flex-1 space-y-1 overflow-y-auto mb-4">
        {rooms.map((room) => (
          <button
            key={room}
            onClick={() => onSelectRoom(room)}
            className={`w-full text-left p-2 rounded-lg transition-all font-medium text-sm ${
              room === currentRoom
                ? "bg-blue-600 text-white shadow-sm"
                : "hover:bg-gray-200 text-gray-700"
            }`}
          >
            # {room}
          </button>
        ))}
      </div>

      {/* Create New Room */}
      <div className="flex gap-2">
        <input
          type="text"
          value={newRoom}
          onChange={(e) => setNewRoom(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && createRoom()}
          placeholder="New room..."
          className="flex-1 p-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={createRoom}
          className="px-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium"
        >
          +
        </button>
      </div>
    </div>
  );
}