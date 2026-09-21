"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { navigation } from "@/lib/site-data";

function isActivePath(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader({
  businessName,
  logoUrl,
}: {
  businessName: string;
  logoUrl: string;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const bookActive = isActivePath(pathname, "/book");

  return (
    <header className="site-header">
      <div className="shell nav-wrap">
        <Link href="/" className="brand-lockup" onClick={() => setOpen(false)} aria-label={`${businessName} - Home`}>
          <Image
            src={logoUrl}
            alt={businessName}
            width={88}
            height={44}
            priority
            className="brand-logo"
          />
          <span className="brand-identity">
            <span className="brand-name">{businessName}</span>
            <span className="brand-services-pill">Makeup · Hair · Nail Art</span>
          </span>
        </Link>
        <button
          className="menu-button"
          onClick={() => setOpen(!open)}
          aria-label="Toggle navigation"
          aria-expanded={open}
        >
          <i />
          <i />
          <i />
        </button>
        <nav className={open ? "nav nav-open" : "nav"} aria-label="Main navigation">
          {navigation.map((item) => {
            const active = isActivePath(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                aria-current={active ? "page" : undefined}
                className={active ? "nav-link-active" : undefined}
              >
                {item.label}
              </Link>
            );
          })}
          <Link
            className={
              bookActive
                ? "button button-small nav-cta-active"
                : "button button-small"
            }
            href="/book"
            onClick={() => setOpen(false)}
            aria-current={bookActive ? "page" : undefined}
          >
            Book appointment
          </Link>
        </nav>
      </div>
    </header>
  );
}
