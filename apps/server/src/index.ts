import "./env.js";
import { createApp, startHttpServer } from "./app.js";
import { db } from "./db/index.js";
import { startWebSocketServer } from "./websocket/server.js";
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

  const app = createApp();
  const httpServer = startHttpServer(app);
  await new Promise<void>((resolve) => httpServer.once("listening", resolve));

  const httpPort = (httpServer.address() as { port: number }).port;
  const wsServer = startWebSocketServer();

  console.log(`✓ [server] http://localhost:${httpPort}`);
  console.log(`✓ [ws] ws://localhost:${wsServer.port}/ws`);
}

start();
