import { useEffect, useRef, useState } from "react";
import { getSocket } from "../services/socket";

interface Message {
  id: string;
  sender: string;
  text?: string;
  file?: { name: string; url: string; type: string };
  timestamp: number;
  readBy: string[];
  reactions: Record<string, string[]>;
}

interface Props {
  room: string;
  currentUser: string;
}

export default function MessageList({ room, currentUser }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const socket = getSocket();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!socket) return;

    const handleMessage = (msg: Message) => {
      setMessages(prev => [...prev, msg]);
      if (msg.sender !== currentUser) {
        new Audio("/beep.mp3").play().catch(() => {});
        if (Notification.permission === "granted") {
          new Notification("New Message", { body: `${msg.sender}: ${msg.text || "File"}` });
        }
      }
    };

    socket.emit("joinRoom", room);
    socket.on("message", handleMessage);
    socket.on("history", (data: { messages: Message[] }) => {
      setMessages(data.messages);
    });

    return () => {
      socket.emit("leaveRoom", room);
      socket.off("message", handleMessage);
      socket.off("history");
    };
  }, [room, socket, currentUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3">
      {messages.map(msg => (
        <div
          key={msg.id}
          className={`flex ${msg.sender === currentUser ? "justify-end" : "justify-start"}`}
        >
          <div
            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
              msg.sender === currentUser ? "bg-blue-600 text-white" : "bg-white border"
            }`}
          >
            <p className="font-medium text-sm">{msg.sender}</p>
            {msg.text && <p>{msg.text}</p>}
            {msg.file && msg.file.type.startsWith("image/") && (
              <img src={msg.file.url} alt={msg.file.name} className="max-w-full rounded mt-1" />
            )}
            {msg.file && !msg.file.type.startsWith("image/") && (
              <a href={msg.file.url} download={msg.file.name} className="text-blue-300 underline">
                {msg.file.name}
              </a>
            )}
            <p className="text-xs opacity-70 mt-1">
              {new Date(msg.timestamp).toLocaleTimeString()}
            </p>
            <div className="flex gap-1 mt-1">
              {Object.entries(msg.reactions).map(([emoji, users]) => (
                <span key={emoji} className="text-xs bg-gray-200 px-2 py-1 rounded-full">
                  {emoji} {users.length}
                </span>
              ))}
            </div>
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}