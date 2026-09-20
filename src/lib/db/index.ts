/**
 * MySQL connection (Drizzle ORM + mysql2).
 *
 * The connection is created lazily and shared. When the database is
 * unreachable, a short-lived "circuit breaker" trips so the public website
 * can immediately fall back to its static configuration instead of waiting
 * for a connection timeout on every request.
 */
import { drizzle, type MySql2Database } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./schema";

export type Database = MySql2Database<typeof schema>;

let pool: mysql.Pool | null = null;
let db: Database | null = null;

/** Timestamp (ms) until which we assume the database is down. */
let downUntil = 0;

const DB_DOWN_COOLDOWN_MS = 20_000;

export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

function getPool(): mysql.Pool {
  if (!pool) {
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error("DATABASE_URL is not configured");
    }
    pool = mysql.createPool({
      uri: url,
      connectionLimit: 5,
      waitForConnections: true,
      // Fail fast so pages can fall back to static content quickly.
      connectTimeout: 4_000,
      enableKeepAlive: true,
      timezone: "Z",
      supportBigNumbers: true,
    });
  }
  return pool;
}

/** Returns the shared Drizzle instance (throws if DATABASE_URL is missing). */
export function getDb(): Database {
  if (!db) {
    db = drizzle(getPool(), { schema, mode: "default" });
  }
  return db;
}

/** True when recent failures suggest the database is unreachable. */
export function isDatabaseProbablyDown(): boolean {
  return Date.now() < downUntil;
}

/** Marks the database as likely down for a short cooldown window. */
export function markDatabaseDown(): void {
  downUntil = Date.now() + DB_DOWN_COOLDOWN_MS;
}

/** Clears the cooldown (e.g. after an operation unexpectedly succeeded). */
export function markDatabaseUp(): void {
  downUntil = 0;
}

/**
 * Runs a database query. Returns null when the database is unconfigured or
 * unreachable — callers decide their own fallback.
 */
export async function queryWithFallback<T>(
  run: (db: Database) => Promise<T>,
): Promise<T | null> {
  if (!isDatabaseConfigured() || isDatabaseProbablyDown()) {
    return null;
  }
  try {
    const result = await run(getDb());
    markDatabaseUp();
    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    // Connection-level failures trip the breaker; SQL errors (bad data,
    // missing table) are logged but do not mark the whole database down.
    if (
      /ECONNREFUSED|ETIMEDOUT|ECONNRESET|ENOTFOUND|EHOSTUNREACH|EPIPE|ER_ACCESS_DENIED_ERROR|handshake|Connection lost/i.test(
        message,
      )
    ) {
      markDatabaseDown();
    }
    console.error("[db] query failed:", message);
    return null;
  }
}

/** Closes the pool (used by scripts). */
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
    db = null;
  }
}
