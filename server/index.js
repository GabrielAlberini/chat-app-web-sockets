import express from "express";
import logger from "morgan";
import dotenv from "dotenv";
import { createClient } from "@libsql/client";

import { Server } from "socket.io";
import { createServer } from "node:http";

dotenv.config();

const PORT = process.env.PORT ?? 3000;

const app = express();
const server = createServer(app);
const io = new Server(server, {
  //Recuperar msj cuando se corta la conexión
  connectionStateRecovery: {},
});

const db = createClient({
  url: process.env.API_URL,
  authToken: process.env.API_TOKEN,
});

await db.execute(`
  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content TEXT
  );
`);

io.on("connection", (socket) => {
  console.log("a user connected");

  socket.on("chat message", async (msg) => {
    let result;
    try {
      result = await db.execute({
        sql: `INSERT INTO messages (content) VALUES (:msg);`,
        args: { msg },
      });
    } catch (error) {
      console.log(error);
      return;
    }
    io.emit("chat message", msg, result.lastInsertRowid.toString());
  });

  socket.on("disconnect", () => {
    console.log("an user has disconnected");
  });
});

app.use(logger("dev"));

app.get("/", (req, res) => {
  res.sendFile(process.cwd() + "/client/index.html");
});

server.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});
