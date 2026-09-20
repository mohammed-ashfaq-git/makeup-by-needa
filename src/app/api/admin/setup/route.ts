/**
 * Secure Admin Setup Endpoint - Drizzle + MySQL
 * Allows creation of initial admin user via ADMIN_SETUP_SECRET
 */

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getDb } from "@/lib/db/client";
import { adminUsers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { generateId } from "@/lib/db/utils";

export async function POST(request: Request) {
  try {
    const setupSecret = process.env.ADMIN_SETUP_SECRET;

    if (!setupSecret) {
      return NextResponse.json(
        { ok: false, message: "Admin setup not configured. Set ADMIN_SETUP_SECRET env." },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { secret, name, email, password } = body;

    if (!secret || secret !== setupSecret) {
      return NextResponse.json(
        { ok: false, message: "Invalid setup secret" },
        { status: 403 }
      );
    }

    if (!email || !password) {
      return NextResponse.json(
        { ok: false, message: "Email and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { ok: false, message: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { ok: false, message: "Invalid email format" },
        { status: 400 }
      );
    }

    const db = getDb();
    if (!db) {
      return NextResponse.json(
        { ok: false, message: "Database not configured" },
        { status: 500 }
      );
    }

    const existingAdmin = await db
      .select()
      .from(adminUsers)
      .where(eq(adminUsers.email, email.toLowerCase().trim()))
      .limit(1);

    if (existingAdmin.length > 0) {
      return NextResponse.json(
        { ok: false, message: "Admin user with this email already exists" },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const id = generateId();

    await db.insert(adminUsers).values({
      id,
      name: name?.trim() || "Admin",
      email: email.toLowerCase().trim(),
      passwordHash,
    });

    const created = await db.select().from(adminUsers).where(eq(adminUsers.id, id)).limit(1);

    return NextResponse.json({
      ok: true,
      message: "Admin user created successfully",
      admin: {
        id: created[0]?.id,
        name: created[0]?.name,
        email: created[0]?.email,
        createdAt: created[0]?.createdAt,
      },
    });
  } catch (error) {
    console.error("Admin setup error:", error);
    return NextResponse.json(
      { ok: false, message: "Failed to create admin user" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const db = getDb();

    if (!db) {
      return NextResponse.json({
        ok: true,
        adminExists: false,
        adminCount: 0,
        setupConfigured: Boolean(process.env.ADMIN_SETUP_SECRET),
        dbConfigured: false,
      });
    }

    const admins = await db.select({ id: adminUsers.id }).from(adminUsers);
    
    return NextResponse.json({
      ok: true,
      adminExists: admins.length > 0,
      adminCount: admins.length,
      setupConfigured: Boolean(process.env.ADMIN_SETUP_SECRET),
      dbConfigured: true,
    });
  } catch (error) {
    console.error("Admin setup check error:", error);
    return NextResponse.json(
      { ok: false, message: "Failed to check admin setup status" },
      { status: 500 }
    );
  }
}
