import "./env.js";
import cors from "cors";
import { sql } from "drizzle-orm";
import express from "express";
import { db, schema } from "./db/index.js";

const app = express();
const port = Number(process.env.PORT) || 3001;
const clientOrigin = process.env.CLIENT_ORIGIN ?? "http://localhost:3000";

app.use(
  cors({
    origin: clientOrigin,
    credentials: true,
  }),
);
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

app.post("/api/users", async (req, res) => {
  const { name, email } = req.body as { name?: string; email?: string };

  if (!name?.trim() || !email?.trim()) {
    res.status(400).json({ error: "name and email are required" });
    return;
  }

  const [user] = await db
    .insert(schema.users)
    .values({ name: name.trim(), email: email.trim() })
    .returning();

  res.status(201).json(user);
});

app.listen(port, () => {
  console.log(`API running on http://localhost:${port}`);
});
