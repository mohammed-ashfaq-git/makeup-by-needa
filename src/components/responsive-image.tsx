"use client";

import Image from "next/image";
import { useCallback, useSyncExternalStore } from "react";

/**
 * Subscribe to a CSS media query without a layout flash.
 *
 * The server snapshot is always `false`, so the desktop asset is what the
 * server (and the first paint) renders; the mobile asset takes over as soon
 * as the browser reports a matching viewport.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", onStoreChange);
      return () => list.removeEventListener("change", onStoreChange);
    },
    [query],
  );

  const getSnapshot = useCallback(() => window.matchMedia(query).matches, [
    query,
  ]);

  const getServerSnapshot = useCallback(() => false, []);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/**
 * CMS-driven image that can serve a dedicated portrait crop on phones.
 *
 * The CMS stores two uploads for hero/gallery images: a desktop file and an
 * optional mobile one. When the mobile file is missing, the desktop file is
 * used instead — always cropped with `object-fit: cover` so photos never
 * stretch or squish.
 */
export function ResponsiveImage({
  desktopSrc,
  mobileSrc,
  alt,
  className,
  sizes = "100vw",
  /** Viewport width (px) below which the mobile crop is served. */
  mobileBreakpoint = 640,
  priority = false,
}: {
  desktopSrc: string;
  mobileSrc?: string | null;
  alt: string;
  className?: string;
  sizes?: string;
  mobileBreakpoint?: number;
  priority?: boolean;
}) {
  const isMobile = useMediaQuery(`(max-width: ${mobileBreakpoint - 1}px)`);
  const src = isMobile && mobileSrc ? mobileSrc : desktopSrc;

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      className={className}
      priority={priority}
    />
  );
}
