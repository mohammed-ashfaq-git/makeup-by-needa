/**
 * Admin sessions.
 *
 * A random token is stored in an httpOnly cookie; only its SHA-256 hash is
 * persisted in the database. Every authenticated request re-validates the
 * session against the database (so logout / revocation is immediate).
 */
import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { and, eq, gt, lt } from "drizzle-orm";
import { getDb, queryWithFallback } from "@/lib/db";
import { adminSessions, adminUsers } from "@/lib/db/schema";

export const SESSION_COOKIE = "mbn_admin_session";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const SESSION_RENEW_THRESHOLD_MS = 3 * 24 * 60 * 60 * 1000;

export type AdminSession = {
  adminId: number;
  name: string;
  email: string;
  expiresAt: Date;
};

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/** Creates a session row and sets the session cookie. */
export async function createSession(adminId: number): Promise<void> {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  await getDb().insert(adminSessions).values({
    tokenHash: hashToken(token),
    adminId,
    expiresAt: expiresAt.toISOString().slice(0, 19).replace("T", " "),
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: Math.floor(SESSION_TTL_MS / 1000),
  });
}

/**
 * Reads the current session (cookie → DB lookup). Returns null when the
 * visitor is not authenticated, the session expired, or the DB is down.
 */
export async function getSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const now = new Date()
    .toISOString()
    .slice(0, 19)
    .replace("T", " ");

  const rows = await queryWithFallback((db) =>
    db
      .select({
        adminId: adminUsers.id,
        name: adminUsers.name,
        email: adminUsers.email,
        expiresAt: adminSessions.expiresAt,
      })
      .from(adminSessions)
      .innerJoin(adminUsers, eq(adminUsers.id, adminSessions.adminId))
      .where(
        and(
          eq(adminSessions.tokenHash, hashToken(token)),
          gt(adminSessions.expiresAt, now),
        ),
      )
      .limit(1),
  );

  const row = rows?.[0];
  if (!row) return null;

  // Sliding renewal: extend sessions that are close to expiring.
  const expiresAt = new Date(row.expiresAt.replace(" ", "T") + "Z");
  if (expiresAt.getTime() - Date.now() < SESSION_RENEW_THRESHOLD_MS) {
    const renewed = new Date(Date.now() + SESSION_TTL_MS);
    try {
      await getDb()
        .update(adminSessions)
        .set({
          expiresAt: renewed.toISOString().slice(0, 19).replace("T", " "),
        })
        .where(eq(adminSessions.tokenHash, hashToken(token)));
    } catch {
      // Non-fatal: the session simply keeps its original expiry.
    }
  }

  return {
    adminId: row.adminId,
    name: row.name,
    email: row.email,
    expiresAt,
  };
}

/** Deletes the session row and clears the cookie. */
export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (token) {
    try {
      await getDb()
        .delete(adminSessions)
        .where(eq(adminSessions.tokenHash, hashToken(token)));
    } catch {
      // If the DB is down the cookie is still cleared below.
    }
  }

  cookieStore.set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

/** Deletes expired session rows (best-effort housekeeping). */
export async function pruneExpiredSessions(): Promise<void> {
  const now = new Date().toISOString().slice(0, 19).replace("T", " ");
  try {
    await getDb()
      .delete(adminSessions)
      .where(lt(adminSessions.expiresAt, now));
  } catch {
    // Ignore housekeeping failures.
  }
}

/** Number of admin accounts (used by the first-run setup page). */
export async function countAdmins(): Promise<number> {
  const rows = await queryWithFallback(async (db) => {
    const result = await db.select({ id: adminUsers.id }).from(adminUsers);
    return result;
  });
  return rows ? rows.length : 0;
}
