"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { navigation } from "@/lib/site-data";

export function SiteHeader({
  businessName,
  logoUrl,
}: {
  businessName: string;
  logoUrl: string;
}) {
  const [open, setOpen] = useState(false);

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
          {navigation.map((item) => (
            <Link key={item.href} href={item.href} onClick={() => setOpen(false)}>
              {item.label}
            </Link>
          ))}
          <Link className="button button-small" href="/book" onClick={() => setOpen(false)}>
            Book appointment
          </Link>
        </nav>
      </div>
    </header>
  );
}
