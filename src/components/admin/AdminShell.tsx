"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { logoutAction } from "@/lib/actions/auth";

const NAV: { label: string; href: string; exact?: boolean }[] = [
  { label: "Dashboard", href: "/admin", exact: true },
  { label: "Website Settings", href: "/admin/settings" },
  { label: "Artist / Bio", href: "/admin/artist" },
  { label: "Services", href: "/admin/services" },
  { label: "Gallery", href: "/admin/gallery" },
  { label: "Testimonials", href: "/admin/testimonials" },
  { label: "FAQs", href: "/admin/faqs" },
  { label: "Enquiries", href: "/admin/enquiries" },
];

export function AdminShell({
  adminName,
  adminEmail,
  businessName,
  children,
}: {
  adminName: string;
  adminEmail: string;
  businessName: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [navOpen, setNavOpen] = useState(false);

  const initials = adminName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

  const isActive = (item: { href: string; exact?: boolean }) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href);

  return (
    <div className={`admin-shell${navOpen ? " nav-open" : ""}`}>
      <button
        type="button"
        className="admin-overlay"
        aria-label="Close menu"
        onClick={() => setNavOpen(false)}
      />

      <aside className="admin-sidebar">
        <div className="admin-sidebar-brand">
          <strong>{businessName}</strong>
          <small>Content manager</small>
        </div>

        <nav className="admin-nav" aria-label="Admin navigation">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={isActive(item) ? "active" : ""}
              onClick={() => setNavOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="admin-sidebar-foot">
          Content management
          <br />
          area — v1.0
        </div>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <button
            type="button"
            className="admin-menu-button"
            aria-label="Open menu"
            aria-expanded={navOpen}
            onClick={() => setNavOpen(!navOpen)}
          >
            ☰
          </button>

          <div className="admin-topbar-user">
            <span className="avatar" aria-hidden="true">
              {initials || "A"}
            </span>
            <div>
              <span>{adminName}</span>
              <small>{adminEmail}</small>
            </div>
          </div>

          <form action={logoutAction}>
            <button type="submit" className="a-btn ghost">
              Log out
            </button>
          </form>
        </header>

        <div className="admin-content">{children}</div>
      </div>
    </div>
  );
}
