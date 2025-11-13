// server/src/index.ts
import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";
import { setupSocket } from "./socket";
import { signToken } from "./auth";

const app = express();

// THESE TWO LINES ARE CRITICAL
app.use(cors());
app.use(express.json());

// THIS ROUTE MUST BE HERE — BEFORE server.listen()
app.post("/login", (req, res) => {
  console.log("LOGIN REQUEST RECEIVED:", req.body); // ← YOU WILL SEE THIS

  const { username } = req.body;

  if (!username || username.trim().length < 2) {
    return res.status(400).json({ error: "Invalid username" });
  }

  const token = signToken(username.trim());
  res.json({ token });
});

// Create HTTP server
const server = http.createServer(app);

// Socket.IO
const io = new Server(server, {
  cors: { origin: "*" },
});

setupSocket(io);

// START SERVER — MUST BE LAST
server.listen(4000, () => {
  console.log("SERVER IS RUNNING ON http://localhost:4000");
  console.log("LOGIN ENDPOINT: POST http://localhost:4000/login");
});