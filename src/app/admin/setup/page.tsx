import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SetupForm } from "@/components/admin/SetupForm";
import { countAdmins } from "@/lib/auth/session";
import { getSettings } from "@/lib/cms";

export const metadata: Metadata = {
  title: "Admin Setup",
  robots: { index: false, follow: false },
};

// The "does an admin already exist?" check must run per request so this
// page closes itself as soon as the first administrator is created.
export const dynamic = "force-dynamic";

export default async function AdminSetupPage() {
  // First-run only: once an administrator exists this page is disabled.
  const adminCount = await countAdmins();
  if (adminCount > 0) {
    redirect("/admin/login");
  }

  const settings = await getSettings();
  const requiresSecret = Boolean(process.env.ADMIN_SETUP_SECRET);

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <div className="auth-brand">
          <span className="mark" aria-hidden="true">
            {settings.businessName.charAt(0)}
          </span>
          <div>
            <strong>{settings.businessName}</strong>
            <small>Website admin</small>
          </div>
        </div>

        <h1>Welcome</h1>
        <p className="sub">
          One-time setup — create the administrator account for the CMS.
        </p>

        <SetupForm requiresSecret={requiresSecret} />

        <p className="auth-foot">
          After this, the setup page closes automatically and you will sign in
          at <a href="/admin/login">/admin/login</a>.
        </p>
      </div>
    </div>
  );
}
