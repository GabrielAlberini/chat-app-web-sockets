import express from "express";
import logger from "morgan";
import dotenv from "dotenv";
import { createClient } from "@libsql/client";

import { Server } from "socket.io";
import { createServer } from "node:http";

dotenv.config();

const PORT = process.env.PORT ?? 3000;
const URL = process.env.API_URL;
const API_TOKEN = process.env.API_TOKEN;

const app = express();
const server = createServer(app);
const io = new Server(server, {
  //Recuperar msj cuando se corta la conexión
  connectionStateRecovery: {},
});

const db = createClient({
  url: URL,
  authToken: API_TOKEN,
});

await db.execute(`
  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content TEXT,
    username TEXT
  );
`);

io.on("connection", async (socket) => {
  console.log("a user connected");

  socket.on("chat message", async (msg) => {
    let result;
    const username = socket.handshake.auth.username ?? "anonymous";
    try {
      result = await db.execute({
        sql: `INSERT INTO messages (content, username) VALUES (:msg, :username);`,
        args: { msg, username },
      });
    } catch (error) {
      console.log(error);
      return;
    }
    io.emit("chat message", msg, result.lastInsertRowid.toString(), username);
  });

  socket.on("disconnect", () => {
    console.log("an user has disconnected");
  });

  if (!socket.recovered) {
    try {
      const result = await db.execute({
        sql: "SELECT id, content, username FROM messages WHERE id > ?",
        args: [socket.handshake.auth.serverOffset ?? 0],
      });

      result.rows.forEach((row) => {
        socket.emit(
          "chat message",
          row.content,
          row.id.toString(),
          row.username
        );
      });
    } catch (error) {}
  }
});

app.use(logger("dev"));

app.get("/", (req, res) => {
  res.sendFile(process.cwd() + "/client/index.html");
});

server.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});
