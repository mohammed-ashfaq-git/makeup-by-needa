/**
 * Database Migration Runner - Drizzle
 * Applies SQL migrations from drizzle folder
 * For Hostinger, you can also manually import SQL via phpMyAdmin
 */

import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import fs from "fs";
import path from "path";

export async function runMigrations() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL not set");
  }

  console.log("🔄 Running database migrations...");

  const pool = mysql.createPool({
    uri: databaseUrl,
    waitForConnections: true,
    connectionLimit: 10,
    multipleStatements: true,
  });

  const db = drizzle(pool, { mode: "default" });

  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    console.log("✅ Connected to MySQL");
  } catch (error) {
    console.error("❌ Failed to connect to MySQL:", error);
    throw error;
  }

  // Drizzle migrations are in drizzle/ folder
  // The drizzle-kit migrate command handles this, but we can also run manually
  // For Hostinger, you can import drizzle/0000_*.sql via phpMyAdmin

  const drizzleFolder = path.join(process.cwd(), "drizzle");
  
  if (!fs.existsSync(drizzleFolder)) {
    console.log("⚠️  No drizzle folder found, skipping file-based migrations");
    await pool.end();
    return;
  }

  const files = fs.readdirSync(drizzleFolder)
    .filter(f => f.endsWith(".sql"))
    .sort();

  console.log(`📁 Found ${files.length} migration files`);

  for (const file of files) {
    const filePath = path.join(drizzleFolder, file);
    const sql = fs.readFileSync(filePath, "utf-8");

    // Split by statement-breakpoint (Drizzle's separator)
    const statements = sql.split("--> statement-breakpoint").map(s => s.trim()).filter(Boolean);

    console.log(`\n📄 Applying ${file} (${statements.length} statements)...`);

    const connection = await pool.getConnection();

    try {
      for (const statement of statements) {
        if (statement) {
          await connection.query(statement);
        }
      }
      console.log(`✅ ${file} applied`);
    } catch (error) {
      console.error(`❌ Failed to apply ${file}:`, error);
      // Continue with next file, don't throw - some statements may already exist
      if (error instanceof Error && error.message.includes("already exists")) {
        console.log(`⏭️  ${file} already applied, skipping`);
      } else {
        throw error;
      }
    } finally {
      connection.release();
    }
  }

  console.log("\n🎉 All migrations completed");
  await pool.end();
}

// Run if called directly
if (require.main === module) {
  runMigrations()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("Migration failed:", error);
      process.exit(1);
    });
}
