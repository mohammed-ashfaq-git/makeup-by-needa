import type { Metadata } from "next";
import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdmin } from "@/lib/auth/guards";
import { getSettings } from "@/lib/cms";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Admin" },
  robots: { index: false, follow: false },
};

/**
 * Security boundary for every /admin page (except login/setup, which live
 * outside this route group). Renders nothing for unauthenticated visitors.
 */
export default async function AdminDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await requireAdmin();
  const settings = await getSettings();

  return (
    <AdminShell
      adminName={session.name}
      adminEmail={session.email}
      businessName={settings.businessName}
    >
      {children}
    </AdminShell>
  );
}
