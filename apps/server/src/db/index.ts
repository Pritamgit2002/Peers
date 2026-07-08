import "../env.js";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema.js";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is not set");
}

function normalizeDatabaseUrl(url: string) {
  const parsed = new URL(url);

  // postgres.js does not support channel_binding.
  parsed.searchParams.delete("channel_binding");

  return parsed.toString();
}

const connectionString = normalizeDatabaseUrl(databaseUrl);
const useSsl = connectionString.includes("sslmode=require");

const client = postgres(connectionString, {
  ssl: useSsl ? "require" : undefined,
  prepare: false,
  connect_timeout: 30,
  max: 10,
  idle_timeout: 20,
});

export const db = drizzle(client, { schema });
export { schema };
