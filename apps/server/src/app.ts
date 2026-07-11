import "./env.js";
import cors from "cors";
import { clerkMiddleware } from "@clerk/express";
import { sql } from "drizzle-orm";
import express, { type Express } from "express";
import { db, schema } from "./db/index.js";
import { messagesRoutes } from "./routes/messages.js";
import { filesRoutes } from "./routes/files.js";
import { filesApiRoutes } from "./routes/files-api.js";
import { usersRoutes } from "./routes/users.js";

export const createApp = (): Express => {
  const app = express();
  const clientOrigin = process.env.CLIENT_ORIGIN ?? "http://localhost:3000";

  app.use(
    cors({
      origin: clientOrigin,
      credentials: true,
    }),
  );
  app.use(clerkMiddleware());
  app.use(express.json());

  app.get("/api/health", async (_, res) => {
    try {
      await db.execute(sql`select 1`);
      res.json({ status: "ok", database: "connected" });
    } catch {
      res.status(503).json({ status: "error", database: "disconnected" });
    }
  });

  app.get("/api/message", (_, res) => {
    res.json({ message: "Hello from Bun + Express API" });
  });

  app.get("/api/users", async (_, res) => {
    const users = await db.select().from(schema.users);
    res.json(users);
  });

  app.use("/api/messages", messagesRoutes);
  app.use("/api/files", filesApiRoutes);
  app.use("/files", filesRoutes);
  app.use("/api/users", usersRoutes);
  return app;
};

export const startHttpServer = (app: Express) => {
  const port = Number(process.env.PORT) || 3001;
  return app.listen(port);
};
