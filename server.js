import "dotenv/config";
import http from "http";
import { Server } from "socket.io";
import app from "./app.js";
import pool from "./database.js";

const port = process.env.PORT || 3000;
const server = http.createServer(app);

server.listen(port, () => {
  console.log("Server running on port", port);
});
