"use client";

import type { CSSProperties, TouchEvent as ReactTouchEvent } from "react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { useMediaQuery } from "@/components/responsive-image";
import { ServiceCard, type ServiceCardData } from "@/components/service-card";

/** The homepage slideshow shows at most this many CMS services. */
const MAX_SLIDES = 10;

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
/** Must match the `--per-view` breakpoints in globals.css. */
const TABLET_QUERY = "(max-width: 1100px)";
const MOBILE_QUERY = "(max-width: 760px)";

const AUTOPLAY_MS = 5000;
/** Time the wrap-around cross-fade needs before the track is re-seated. */
const RESEAT_MS = 200;
/** How long a touch holds autoplay after the finger leaves the screen. */
const TOUCH_RESUME_MS = 6000;
const SWIPE_THRESHOLD_PX = 45;

/* Stable subscribers for useSyncExternalStore — defined once at module scope
   so the listener is never re-attached on render. */
function subscribeTabVisibility(onChange: () => void) {
  document.addEventListener("visibilitychange", onChange);
  return () => document.removeEventListener("visibilitychange", onChange);
}
const getTabHidden = () => document.hidden;
const getTabHiddenOnServer = () => false;

type CarouselEntry = {
  service: ServiceCardData;
  /** Position in the original list, so numbering never changes on rotation. */
  index: number;
};

/**
 * Homepage services slideshow.
 *
 * - Shows up to 10 CMS services, 1 / 2 / 3 cards per view by breakpoint.
 * - Auto-advances forever, pausing on hover, keyboard focus, hidden tab and
 *   touch, and never auto-advances when the visitor prefers reduced motion.
 * - Arrows, dots, a counter and swipe all drive the same position state.
 *
 * The track always renders exactly one slide per service: reaching the end of
 * the strip re-seats the loop with a short cross-fade instead of quietly
 * cloning slides into the page.
 */
export function ServiceCarousel({
  services,
  label = "Services",
}: {
  services: ServiceCardData[];
  label?: string;
}) {
  const items = useMemo<CarouselEntry[]>(
    () =>
      services
        .slice(0, MAX_SLIDES)
        .map((service, index) => ({ service, index })),
    [services],
  );
  const count = items.length;

  const reducedMotion = useMediaQuery(REDUCED_MOTION_QUERY);
  const isTablet = useMediaQuery(TABLET_QUERY);
  const isMobile = useMediaQuery(MOBILE_QUERY);
  const perView = isMobile ? 1 : isTablet ? 2 : 3;

  const tabHidden = useSyncExternalStore(
    subscribeTabVisibility,
    getTabHidden,
    getTabHiddenOnServer,
  );

  /** First slide of the track, i.e. the rotation applied to the list. */
  const [start, setStart] = useState(0);
  /** Animated offset within the current rotation (0 … maxStep). */
  const [step, setStep] = useState(0);
  const [reseating, setReseating] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [touched, setTouched] = useState(false);

  const reseatTimer = useRef<number | null>(null);
  const touchTimer = useRef<number | null>(null);
  const reseatLock = useRef(false);
  const swipeStartX = useRef<number | null>(null);

  // Derived during render so a resize can never leave the strip past its end.
  const maxStep = Math.max(0, count - perView);
  const safeStep = Math.min(step, maxStep);
  const safeStart = count > 0 ? start % count : 0;
  const active = count > 0 ? (safeStart + safeStep) % count : 0;
  const canAdvance = maxStep > 0;

  const order = useMemo(
    () => (safeStart === 0 ? items : [...items.slice(safeStart), ...items.slice(0, safeStart)]),
    [items, safeStart],
  );

  useEffect(
    () => () => {
      if (reseatTimer.current !== null) {
        window.clearTimeout(reseatTimer.current);
      }
      if (touchTimer.current !== null) window.clearTimeout(touchTimer.current);
    },
    [],
  );

  /**
   * Wrap the loop: fade the strip out, re-seat it on the next window, then
   * fade back in.
   *
   * The strip is rotated so the window can always be rendered, and a window
   * can only be slid left while `step < maxStep`. The re-seat therefore shows
   * the window one slide on from the one on screen (`nextFirst`) with the
   * animation offset wound back so sliding can continue — which is why every
   * service is still visited exactly once per lap.
   */
  const reseat = useCallback(
    (direction: 1 | -1) => {
      if (reseatLock.current) return;

      const currentFirst = (safeStart + safeStep) % count;
      const nextFirst = (currentFirst + direction + count) % count;
      const nextStart =
        direction === 1 ? nextFirst : (nextFirst - maxStep + count) % count;
      const nextStep = direction === 1 ? 0 : maxStep;

      const apply = () => {
        setStart(nextStart);
        setStep(nextStep);
        setReseating(false);
        reseatLock.current = false;
      };

      if (reducedMotion) {
        apply();
        return;
      }

      reseatLock.current = true;
      setReseating(true);
      reseatTimer.current = window.setTimeout(apply, RESEAT_MS);
    },
    [count, maxStep, reducedMotion, safeStart, safeStep],
  );

  const goNext = useCallback(() => {
    if (!canAdvance) return;
    if (safeStep < maxStep) {
      setStep(safeStep + 1);
      return;
    }
    reseat(1);
  }, [canAdvance, maxStep, reseat, safeStep]);

  const goPrev = useCallback(() => {
    if (!canAdvance) return;
    if (safeStep > 0) {
      setStep(safeStep - 1);
      return;
    }
    reseat(-1);
  }, [canAdvance, reseat, safeStep]);

  const goTo = useCallback(
    (index: number) => {
      if (!canAdvance || index === active) return;
      setStart(index);
      setStep(0);
    },
    [active, canAdvance],
  );

  // Autoplay. Paused by pointer, focus, a hidden tab, touch, reduced motion,
  // or a viewport wide enough to show every service at once.
  const paused = hovered || focused || touched || tabHidden || reducedMotion;

  useEffect(() => {
    if (paused || !canAdvance) return;
    const id = window.setInterval(goNext, AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [canAdvance, goNext, paused]);

  const handleTouchStart = (event: ReactTouchEvent) => {
    swipeStartX.current = event.touches[0]?.clientX ?? null;
    setTouched(true);
    if (touchTimer.current !== null) {
      window.clearTimeout(touchTimer.current);
      touchTimer.current = null;
    }
  };

  const handleTouchEnd = (event: ReactTouchEvent) => {
    const startX = swipeStartX.current;
    const endX = event.changedTouches[0]?.clientX ?? null;
    swipeStartX.current = null;

    if (startX !== null && endX !== null) {
      const distance = endX - startX;
      if (Math.abs(distance) > SWIPE_THRESHOLD_PX) {
        if (distance < 0) goNext();
        else goPrev();
      }
    }

    touchTimer.current = window.setTimeout(
      () => setTouched(false),
      TOUCH_RESUME_MS,
    );
  };

  if (count === 0) return null;

  return (
    <section
      className={`service-carousel${reseating ? " is-reseating" : ""}`}
      style={{ "--per-view": perView } as CSSProperties}
      role="region"
      aria-roledescription="carousel"
      aria-label={`${label} slideshow`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      onKeyDown={(event) => {
        if (event.key === "ArrowRight") {
          event.preventDefault();
          goNext();
        } else if (event.key === "ArrowLeft") {
          event.preventDefault();
          goPrev();
        }
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >
      <div className="service-carousel-viewport">
        <div
          className="service-carousel-track"
          style={{
            transform: `translate3d(-${(safeStep * 100) / perView}%, 0, 0)`,
          }}
        >
          {order.map((entry) => (
            <div
              className="service-carousel-slide"
              key={`${entry.service.id ?? entry.service.name}-${entry.index}`}
              role="group"
              aria-roledescription="slide"
              aria-label={`${entry.index + 1} of ${count}`}
            >
              <ServiceCard service={entry.service} index={entry.index} />
            </div>
          ))}
        </div>
      </div>

      {canAdvance ? (
        <div className="service-carousel-controls">
          <button
            type="button"
            className="service-carousel-arrow service-carousel-arrow-prev"
            onClick={goPrev}
            aria-label="Previous services"
          >
            <span aria-hidden="true">‹</span>
          </button>

          <div className="service-carousel-progress">
            <span className="service-carousel-counter">
              {String(active + 1).padStart(2, "0")}
              <i> / {String(count).padStart(2, "0")}</i>
            </span>

            <div className="service-carousel-pagination">
              {items.map((entry, index) => (
                <button
                  key={`dot-${entry.index}`}
                  type="button"
                  className={`service-carousel-dot${
                    index === active ? " is-active" : ""
                  }`}
                  onClick={() => goTo(index)}
                  aria-label={`Go to slide ${index + 1} of ${count}`}
                  aria-current={index === active ? "true" : undefined}
                />
              ))}
            </div>
          </div>

          <button
            type="button"
            className="service-carousel-arrow service-carousel-arrow-next"
            onClick={goNext}
            aria-label="Next services"
          >
            <span aria-hidden="true">›</span>
          </button>
        </div>
      ) : null}
    </section>
  );
}
