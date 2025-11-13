import { useEffect, useState } from "react";
import { getSocket } from "../services/socket";

interface Props {
  room: string;
}

export default function TypingIndicator({ room }: Props) {
  const [typing, setTyping] = useState<string[]>([]);
  const socket = getSocket();

  // Run effect only if socket exists
  useEffect(() => {
    if (!socket) return;

    const handler = ({ username, isTyping }: { username: string; isTyping: boolean }) => {
      setTyping((prev) => {
        const next = prev.filter((u) => u !== username);
        return isTyping ? [...next, username] : next;
      });
    };

    socket.on("typing", handler);

    // Cleanup: remove listener
    return () => {
      socket.off("typing", handler);
    };
  }, [socket, room]); // ← Dependencies are safe now

  if (typing.length === 0) return null;

  return (
    <div className="px-4 py-1 text-sm text-gray-600 italic">
      {typing.join(", ")} {typing.length > 1 ? "are" : "is"} typing...
    </div>
  );
}