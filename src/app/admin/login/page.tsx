import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/LoginForm";
import { getSession } from "@/lib/auth/session";
import { getSettings } from "@/lib/cms";

export const metadata: Metadata = {
  title: "Admin Log In",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  // Already signed in? Straight to the dashboard.
  const session = await getSession();
  if (session) {
    redirect("/admin");
  }

  const settings = await getSettings();

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

        <h1>Log in</h1>
        <p className="sub">Manage your website content and enquiries.</p>

        <LoginForm />

        <p className="auth-foot">
          Lost your password? Use the reset script on the server
          (<code>npm run admin:reset-password</code>) or contact your
          developer.
        </p>
      </div>
    </div>
  );
}
