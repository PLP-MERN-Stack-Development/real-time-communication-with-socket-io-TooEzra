// client/src/App.tsx
import { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "./hooks/useAuth";
import Chat from "./components/Chat";

export default function App() {
  const { token, username, signIn } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [inputName, setInputName] = useState("");

  // Keep socket instance in ref to avoid re-creating on every render
  const socketRef = useRef<Socket | null>(null);

  // Connect socket once after login
  useEffect(() => {
    if (!token || socketRef.current) return;

    const newSocket = io("http://localhost:4000", {
      auth: { token },
    });

    newSocket.on("connect", () => {
      console.log("Connected to server!");
      setSocket(newSocket);
    });

    newSocket.on("connect_error", (err) => {
      console.error("Connection failed:", err.message);
    });

    socketRef.current = newSocket;

    // Cleanup on unmount
    return () => {
      newSocket.disconnect();
      socketRef.current = null;
      setSocket(null);
    };
  }, [token]); // Only runs when token appears (after login)

  // LOGIN SCREEN
  if (!token || !username) {
    const handleLogin = () => {
      if (inputName.trim()) {
        signIn(inputName.trim());
        setInputName("");
      }
    };

    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-blue-600 to-purple-700">
        <div className="bg-white p-12 rounded-3xl shadow-2xl w-96 text-center">
          <h1 className="text-4xl font-bold mb-8 text-gray-800">Join Chat</h1>
          <input
            type="text"
            value={inputName}
            onChange={(e) => setInputName(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleLogin()}
            placeholder="Enter your name"
            className="w-full px-6 py-4 text-lg border-2 border-blue-500 rounded-2xl focus:outline-none focus:border-blue-600 mb-6"
            autoFocus
          />
          <button
            onClick={handleLogin}
            className="w-full bg-blue-600 text-white py-4 rounded-2xl text-xl font-bold hover:bg-blue-700 transition"
          >
            Start Chatting
          </button>
        </div>
      </div>
    );
  }

  // CONNECTING...
  if (!socket) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="text-2xl font-semibold text-blue-600">
          Connecting to chat server...
        </div>
      </div>
    );
  }

  // MAIN CHAT
  return <Chat socket={socket} username={username} />;
}