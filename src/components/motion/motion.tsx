"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { usePathname } from "next/navigation";

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "left" | "right";
  media?: boolean;
};

export function Reveal({
  children,
  className = "",
  delay = 0,
  direction = "up",
  media = false,
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          node.dataset.visible = "true";
          observer.unobserve(node);
        }
      },
      { threshold: 0.14, rootMargin: "0px 0px -6%" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal reveal-${direction}${media ? " reveal-media" : ""} ${className}`}
      style={{ "--reveal-delay": `${delay}ms` } as React.CSSProperties}
    >
      {children}
    </div>
  );
}

export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const sections = [
      ...document.querySelectorAll<HTMLElement>("main section:not(.hero), footer"),
    ];

    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            observer.unobserve(entry.target);
          }
        }),
      { threshold: 0.08, rootMargin: "0px 0px -5%" }
    );

    sections.forEach((section) => {
      section.classList.add("motion-section");
      observer.observe(section);
    });

    return () => observer.disconnect();
  }, [pathname]);

  return (
    <div className="page-transition" key={pathname}>
      {children}
    </div>
  );
}
