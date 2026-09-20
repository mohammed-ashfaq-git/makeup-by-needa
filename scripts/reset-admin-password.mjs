/**
 * Admin account recovery — server-side script, never exposed to the browser.
 *
 * Creates or updates an administrator account with a new bcrypt password.
 * Run this on the server if the password is lost:
 *
 *   npm run admin:reset-password -- --email you@example.com --password 'new-secret'
 *   # optional: --name "Needa"
 */
import "dotenv/config";
import { createInterface } from "node:readline/promises";
import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";

function arg(name) {
  const index = process.argv.indexOf(`--${name}`);
  return index !== -1 ? process.argv[index + 1] : undefined;
}

async function promptHidden(label) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  // Hide typed characters where the terminal supports it.
  const stdin = process.stdin;
  stdin.setRawMode?.(true);
  let value = "";
  process.stdout.write(label);
  await new Promise((resolve) => {
    const onData = (chunk) => {
      const char = chunk.toString();
      if (char === "\r" || char === "\n") {
        stdin.setRawMode?.(false);
        stdin.pause();
        process.stdout.write("\n");
        stdin.removeListener("data", onData);
        resolve();
      } else if (char === "\u0003") {
        process.exit(1);
      } else {
        value += char;
        process.stdout.write("*");
      }
    };
    stdin.resume();
    stdin.on("data", onData);
  });
  rl.close();
  return value;
}

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL is not set (see .env.example).");
    process.exit(1);
  }

  const email = arg("email")?.toLowerCase();
  let password = arg("password");

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    console.error("Usage: npm run admin:reset-password -- --email you@example.com [--password 'new-password'] [--name 'Your name']");
    process.exit(1);
  }

  if (!password) {
    password = await promptHidden("New password: ");
    if (password.length < 8) {
      console.error("Password must be at least 8 characters.");
      process.exit(1);
    }
  }

  const name = arg("name") ?? "Administrator";
  const passwordHash = await bcrypt.hash(password, 10);

  const db = await mysql.createConnection({ uri: url });

  try {
    await db.execute(
      `INSERT INTO admin_users (name, email, password_hash)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE name = VALUES(name), password_hash = VALUES(password_hash)`,
      [name, email, passwordHash],
    );

    // Invalidate existing sessions for safety.
    await db.execute("DELETE FROM admin_sessions");

    console.log(`✓ Admin account saved for ${email}.`);
    console.log("  All existing sessions were signed out.");
  } finally {
    await db.end();
  }
}

main().catch((error) => {
  console.error("Failed:", error.message);
  process.exit(1);
});
