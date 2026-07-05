import { createApp } from "./app.js";
import { db } from "./db/index.js";
import { sql } from "drizzle-orm";

async function start() {
  await db.execute(sql`SELECT 1`);
  console.log("✓ [db] connected");

  const server = createApp();
  await new Promise<void>((resolve) => server.once("listening", resolve));
  const port = (server.address() as { port: number }).port;
  console.log(`✓ [server] http://localhost:${port}`);
}

start();
