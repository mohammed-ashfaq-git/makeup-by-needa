/**
 * Auth guards for server components, server actions and API routes.
 *
 * Every admin mutation must call one of these — the proxy and layout
 * checks are a convenience layer, not the security boundary.
 */
import { redirect } from "next/navigation";
import { getSession, type AdminSession } from "./session";

/**
 * Returns the current admin session or null. Safe to use in server
 * components and route handlers.
 */
export async function getCurrentAdmin(): Promise<AdminSession | null> {
  return getSession();
}

/**
 * Guard for server components / server actions: redirects to the login
 * page when there is no valid session.
 */
export async function requireAdmin(): Promise<AdminSession> {
  const session = await getSession();
  if (!session) {
    redirect("/admin/login");
  }
  return session;
}

/** Guard for route handlers: returns a 401 response or the session. */
export async function requireAdminApi(): Promise<
  { session: AdminSession; response: null } | { session: null; response: Response }
> {
  const session = await getSession();
  if (!session) {
    return {
      session: null,
      response: new Response(JSON.stringify({ ok: false, message: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }),
    };
  }
  return { session, response: null };
}

/** Best-effort client IP for rate limiting. */
export function clientIpFromHeaders(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return headers.get("x-real-ip") ?? "unknown";
}
