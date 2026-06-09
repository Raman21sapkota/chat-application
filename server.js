import "dotenv/config";
import http from "http";
import { Server } from "socket.io";
import app from "./app.js";
import pool from "./database.js";
import handleSocket from "./socket.js";

const port = process.env.PORT || 3000;
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);
  handleSocket(io, socket);
});

server.listen(port, () => {
  console.log("Server running on port", port);
});
