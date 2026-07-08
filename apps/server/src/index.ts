import "./env.js";
import { createApp } from "./app.js";
import { db } from "./db/index.js";
import { sql } from "drizzle-orm";

async function connectDatabase(retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await db.execute(sql`SELECT 1`);
      console.log("✓ [db] connected");
      return;
    } catch (error) {
      if (attempt === retries) {
        throw error;
      }

      console.warn(
        `[db] connection attempt ${attempt}/${retries} failed, retrying...`,
      );
      await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
    }
  }
}

async function start() {
  await connectDatabase();

  const server = createApp();
  await new Promise<void>((resolve) => server.once("listening", resolve));
  const port = (server.address() as { port: number }).port;
  console.log(`✓ [server] http://localhost:${port}`);
}

start();
