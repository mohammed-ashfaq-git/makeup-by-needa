"use server";

/**
 * Authentication actions: admin login, logout and first-run setup.
 */
import { createHash, timingSafeEqual } from "node:crypto";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb, queryWithFallback } from "@/lib/db";
import { adminUsers } from "@/lib/db/schema";
import { verifyPassword, hashPassword } from "@/lib/auth/password";
import {
  createSession,
  destroySession,
  countAdmins,
} from "@/lib/auth/session";
import {
  checkRateLimit,
  pruneRateLimits,
  resetRateLimit,
} from "@/lib/auth/rate-limit";
import { clientIpFromHeaders } from "@/lib/auth/guards";
import type { ActionState } from "@/lib/form";

const LOGIN_LIMIT = 8;
const LOGIN_WINDOW_MS = 10 * 60 * 1000;
const SETUP_LIMIT = 5;
const SETUP_WINDOW_MS = 15 * 60 * 1000;

const credentialsSchema = z.object({
  email: z.email("Please enter a valid email address.").max(255),
  password: z.string().min(1, "Please enter your password.").max(200),
});

const setupSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name.").max(120),
  email: z.email("Please enter a valid email address.").max(255),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .max(200),
  setupSecret: z.string().max(500).optional(),
});

/** Constant-time string comparison. */
function safeEqual(a: string, b: string): boolean {
  const hashA = createHash("sha256").update(a).digest();
  const hashB = createHash("sha256").update(b).digest();
  return timingSafeEqual(hashA, hashB);
}

export async function loginAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = credentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return {
      ok: false,
      message: "Please check your details and try again.",
      fieldErrors,
    };
  }

  const email = parsed.data.email.toLowerCase();
  const password = parsed.data.password;

  pruneRateLimits();
  const headerList = await headers();
  const ip = clientIpFromHeaders(headerList);
  const rateKey = `login:${ip}:${email}`;

  const limit = checkRateLimit(rateKey, LOGIN_LIMIT, LOGIN_WINDOW_MS);
  if (!limit.allowed) {
    return {
      ok: false,
      message: `Too many attempts. Please try again in ${Math.ceil(limit.retryInSeconds / 60)} minute(s).`,
    };
  }

  const rows = await queryWithFallback((db) =>
    db
      .select()
      .from(adminUsers)
      .where(eq(adminUsers.email, email))
      .limit(1),
  );

  const user = rows?.[0];

  // Uniform error: never reveal whether the email exists.
  const invalid: ActionState = {
    ok: false,
    message: "Incorrect email or password.",
  };

  if (!user) {
    // Equalise timing so user enumeration via response time is harder.
    await verifyPassword(password, "$2a$10$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvalidinv");
    return invalid;
  }

  const passwordOk = await verifyPassword(password, user.passwordHash);
  if (!passwordOk) {
    return invalid;
  }

  resetRateLimit(rateKey);

  try {
    await getDb()
      .update(adminUsers)
      .set({
        lastLoginAt: new Date().toISOString().slice(0, 19).replace("T", " "),
      })
      .where(eq(adminUsers.id, user.id));
  } catch {
    // Non-fatal.
  }

  await createSession(user.id);
  redirect("/admin");
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/admin/login");
}

export async function createFirstAdminAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const adminCount = await countAdmins();

  if (adminCount > 0) {
    return {
      ok: false,
      message:
        "An administrator already exists. Please log in, or use the reset password script if you are locked out.",
    };
  }

  // First-run setup has no known email account yet, so limit attempts by the
  // caller's IP before checking the optional setup secret or password fields.
  pruneRateLimits();
  const headerList = await headers();
  const ip = clientIpFromHeaders(headerList);
  const rateKey = `setup:${ip}`;
  const limit = checkRateLimit(rateKey, SETUP_LIMIT, SETUP_WINDOW_MS);
  if (!limit.allowed) {
    return {
      ok: false,
      message: `Too many setup attempts. Please try again in ${Math.ceil(limit.retryInSeconds / 60)} minute(s).`,
    };
  }

  // When ADMIN_SETUP_SECRET is configured, it must match — but it is only
  // ever compared here, on the server. It is never sent to the browser.
  const requiredSecret = process.env.ADMIN_SETUP_SECRET;
  if (requiredSecret) {
    const supplied = formData.get("setupSecret");
    if (typeof supplied !== "string" || !safeEqual(supplied, requiredSecret)) {
      return {
        ok: false,
        message: "The setup secret is incorrect.",
        fieldErrors: { setupSecret: "Incorrect setup secret." },
      };
    }
  }

  const parsed = setupSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return {
      ok: false,
      message: "Please check your details and try again.",
      fieldErrors,
    };
  }

  const email = parsed.data.email.toLowerCase();

  const existing = await queryWithFallback((db) =>
    db
      .select({ id: adminUsers.id })
      .from(adminUsers)
      .where(eq(adminUsers.email, email))
      .limit(1),
  );
  if (existing && existing.length > 0) {
    return {
      ok: false,
      message: "That email is already registered.",
      fieldErrors: { email: "That email is already registered." },
    };
  }

  const passwordHash = await hashPassword(parsed.data.password);

  let adminId: number;
  try {
    const result = await getDb()
      .insert(adminUsers)
      .values({
        name: parsed.data.name,
        email,
        passwordHash,
      });
    adminId = Number((result[0] as { insertId: number }).insertId);
  } catch (error) {
    console.error("[admin-setup] failed:", error);
    return {
      ok: false,
      message: "Could not create the administrator account. Is the database reachable?",
    };
  }

  resetRateLimit(rateKey);
  await createSession(adminId);
  redirect("/admin");
}
