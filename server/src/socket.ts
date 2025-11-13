import { Server, Socket } from "socket.io";
import { verifyToken } from "./auth";
import { getRoomMessages, addMessage } from "./rooms";
import { PlainMessage } from "./types";

export const setupSocket = (io: Server) => {
  io.use((socket: Socket, next) => {
    const token = socket.handshake.auth.token as string;
    const payload = verifyToken(token);
    if (!payload) return next(new Error("Unauthorized"));
    (socket as any).username = payload.username;
    next();
  });

  io.on("connection", (socket: Socket) => {
    const username = (socket as any).username;
    console.log(`${username} connected`);

    socket.join("global");

    // Send active rooms
    const rooms = Array.from(socket.rooms).filter(r => r !== socket.id);
    socket.emit("rooms", rooms);

    // Join room + load history
    socket.on("joinRoom", async (room: string) => {
      socket.join(room);
      const history = await getRoomMessages(room);
      socket.emit("history", { room, messages: history.slice(-50) });
      socket.to(room).emit("notification", `${username} joined ${room}`);
    });

    // Send message
    socket.on(
      "message",
      async (
        data: { room: string; text?: string; file?: any },
        ack?: (res: any) => void
      ) => {
        const msg: PlainMessage = {
          room: data.room,
          sender: username,
          text: data.text?.trim() || undefined,
          file: data.file,
          timestamp: Date.now(),
          readBy: [username],
          reactions: {},
        };

        await addMessage(msg);
        io.to(data.room).emit("message", msg);
        ack?.({ status: "delivered" });
      }
    );

    socket.on("disconnect", () => {
      console.log(`${username} disconnected`);
    });
  });
};