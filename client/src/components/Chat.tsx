// client/src/components/Chat.tsx

import { useEffect, useState, useRef } from "react";
import { Socket } from "socket.io-client";

interface ChatProps {
  socket: Socket;
  username: string;
}

interface Message {
  room: string;
  sender: string;
  text?: string;
  file?: {
    name: string;
    url: string;
    type: string;
  };
  timestamp: number;
  readBy: string[];
  reactions: Record<string, string[]>;
}

export default function Chat({ socket, username }: ChatProps) {
  const [rooms, setRooms] = useState<string[]>(["global"]);
  const [currentRoom, setCurrentRoom] = useState<string>("global");
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [newRoomName, setNewRoomName] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // SAFETY CHECK — Prevent crash if socket is undefined
  useEffect(() => {
    if (!socket) {
      console.error("Socket is not connected!");
      return;
    }

    // Join global room
    socket.emit("joinRoom", "global");

    const handleRooms = (roomList: string[]) => {
      setRooms(["global", ...roomList.filter(r => r !== "global")]);
    };

    const handleHistory = ({ room, messages: history }: { room: string; messages: Message[] }) => {
      if (room === currentRoom) {
        setMessages(history);
      }
    };

    const handleMessage = (msg: Message) => {
      if (msg.room === currentRoom) {
        setMessages(prev => [...prev, msg]);
      }
    };

    const handleNotification = (text: string) => {
      console.log("Notification:", text);
    };

    socket.on("rooms", handleRooms);
    socket.on("history", handleHistory);
    socket.on("message", handleMessage);
    socket.on("notification", handleNotification);

    return () => {
      socket.off("rooms", handleRooms);
      socket.off("history", handleHistory);
      socket.off("message", handleMessage);
      socket.off("notification", handleNotification);
    };
  }, [socket, currentRoom]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const joinRoom = (room: string) => {
    if (!socket) return;
    socket.emit("joinRoom", room);
    setCurrentRoom(room);
    setMessages([]);
  };

  const createRoom = () => {
    const room = newRoomName.trim();
    if (room && !rooms.includes(room)) {
      joinRoom(room);
      setNewRoomName("");
    }
  };

  const sendMessage = () => {
    if (!socket || !newMessage.trim()) return;

    socket.emit("message", {
      room: currentRoom,
      text: newMessage.trim(),
    });
    setNewMessage("");
  };

  // PREVENT RENDER IF SOCKET NOT READY
  if (!socket) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="text-xl text-red-600">Connecting to server...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg flex flex-col">
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold mb-3">Rooms</h2>
          <div className="flex gap-2">
            <input
              type="text"
              value={newRoomName}
              onChange={(e) => setNewRoomName(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && createRoom()}
              placeholder="New room name..."
              className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={createRoom}
              className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
            >
              Create
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {rooms.map((room) => (
            <button
              key={room}
              onClick={() => joinRoom(room)}
              className={`block w-full text-left px-4 py-3 hover:bg-gray-100 transition ${
                currentRoom === room
                  ? "bg-blue-100 font-bold border-l-4 border-blue-600"
                  : ""
              }`}
            >
              # {room === "global" ? "General" : room}
            </button>
          ))}
        </div>

        <div className="p-4 border-t bg-gray-50">
          <p className="text-sm text-gray-600">Logged in as</p>
          <p className="font-bold text-blue-600">{username}</p>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        <div className="bg-blue-600 text-white p-4 shadow">
          <h1 className="text-2xl font-bold">
            # {currentRoom === "global" ? "General" : currentRoom}
          </h1>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.sender === username ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow ${
                  msg.sender === username
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-800"
                }`}
              >
                <p className="text-xs opacity-70 mb-1">{msg.sender}</p>
                <p>{msg.text || "[File]"}</p>
                <p className="text-xs opacity-70 mt-1 text-right">
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 bg-white border-t">
          <div className="flex gap-3">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Type a message..."
              className="flex-1 px-4 py-3 border rounded-full focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={sendMessage}
              className="px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}