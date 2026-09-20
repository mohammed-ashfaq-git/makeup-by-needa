/**
 * Authentication Module - Drizzle + MySQL
 * Secure admin authentication with bcrypt
 */

import bcrypt from "bcryptjs";
import { getDb } from "@/lib/db/client";
import { adminUsers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function authenticateAdmin(email: string, password: string) {
  const db = getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(adminUsers)
    .where(eq(adminUsers.email, email.toLowerCase().trim()))
    .limit(1);

  const admin = result[0];

  if (!admin) {
    return null;
  }

  const isValid = await verifyPassword(password, admin.passwordHash);

  if (!isValid) {
    return null;
  }

  return {
    id: admin.id,
    name: admin.name,
    email: admin.email,
  };
}

export async function getAdminById(id: string) {
  const db = getDb();
  if (!db) return null;

  const result = await db
    .select({
      id: adminUsers.id,
      name: adminUsers.name,
      email: adminUsers.email,
      createdAt: adminUsers.createdAt,
    })
    .from(adminUsers)
    .where(eq(adminUsers.id, id))
    .limit(1);

  return result[0] || null;
}

export async function getAdminByEmail(email: string) {
  const db = getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(adminUsers)
    .where(eq(adminUsers.email, email.toLowerCase().trim()))
    .limit(1);

  return result[0] || null;
}
