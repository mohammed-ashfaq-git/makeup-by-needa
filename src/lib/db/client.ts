/**
 * Database Client - MySQL with Drizzle ORM
 * Singleton pattern for Next.js (prevents multiple pools in dev)
 * Also includes Prisma client for backward compatibility (optional)
 */

import { drizzle, type MySql2Database } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./schema";

// Global types for singleton
declare global {
  // eslint-disable-next-line no-var
  var mysqlPool: mysql.Pool | undefined;
  // eslint-disable-next-line no-var
  var drizzleDb: MySql2Database<typeof schema> | undefined;
  // eslint-disable-next-line no-var
  var prisma: any | undefined;
}

function createMysqlPool(): mysql.Pool | null {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.warn("DATABASE_URL not set - database operations will use fallback");
    return null;
  }

  // Parse MySQL URL or use connection string directly
  // mysql2 can handle mysql://user:pass@host:port/db format
  try {
    const pool = mysql.createPool({
      uri: databaseUrl,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
    });

    return pool;
  } catch (error) {
    console.error("Failed to create MySQL pool:", error);
    return null;
  }
}

function getMysqlPool(): mysql.Pool | null {
  if (global.mysqlPool) {
    return global.mysqlPool;
  }

  const pool = createMysqlPool();

  if (pool && process.env.NODE_ENV !== "production") {
    global.mysqlPool = pool;
  }

  return pool;
}

function createDrizzleDb(): MySql2Database<typeof schema> | null {
  const pool = getMysqlPool();

  if (!pool) {
    return null;
  }

  return drizzle(pool, { schema, mode: "default" });
}

export function getDb(): MySql2Database<typeof schema> | null {
  if (global.drizzleDb) {
    return global.drizzleDb;
  }

  const db = createDrizzleDb();

  if (db && process.env.NODE_ENV !== "production") {
    global.drizzleDb = db;
  }

  return db;
}

// Main db export - may be null if DATABASE_URL not set (graceful fallback)
export const db = getDb();

// For backward compatibility, also export prisma-like object
// This allows existing code to continue working while we migrate
let prismaClient: any = null;

try {
  // Try to import Prisma client if available and generated
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { PrismaClient } = require("@prisma/client");
  
  if (global.prisma) {
    prismaClient = global.prisma;
  } else {
    prismaClient = new PrismaClient({
      log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    });
    
    if (process.env.NODE_ENV !== "production") {
      global.prisma = prismaClient;
    }
  }
} catch {
  // Prisma client not available (offline build) - create mock that will fail gracefully
  console.warn("Prisma client not available - using Drizzle only");
  prismaClient = null;
}

export const prisma = prismaClient;

// Database connection health check
export async function checkDatabaseConnection(): Promise<{
  connected: boolean;
  message: string;
  driver: string;
}> {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    return {
      connected: false,
      message: "DATABASE_URL not configured - using fallback mode",
      driver: "none",
    };
  }

  // Try Drizzle/MySQL2 first
  try {
    const pool = getMysqlPool();
    if (pool) {
      const connection = await pool.getConnection();
      await connection.ping();
      connection.release();
      return {
        connected: true,
        message: "MySQL connected via Drizzle (mysql2)",
        driver: "drizzle-mysql2",
      };
    }
  } catch (error) {
    console.warn("MySQL2 connection failed, trying Prisma:", error);
  }

  // Try Prisma fallback
  if (prisma) {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return {
        connected: true,
        message: "MySQL connected via Prisma",
        driver: "prisma",
      };
    } catch (error) {
      console.error("Prisma connection failed:", error);
    }
  }

  return {
    connected: false,
    message: "Failed to connect to MySQL - check DATABASE_URL",
    driver: "none",
  };
}

// Graceful disconnect
export async function disconnectDatabase(): Promise<void> {
  try {
    if (global.mysqlPool) {
      await global.mysqlPool.end();
    }
    if (prisma) {
      await prisma.$disconnect();
    }
  } catch (error) {
    console.error("Error disconnecting database:", error);
  }
}

export default db;
