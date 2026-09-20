import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--sand)] px-6 py-20 text-center">
      <div className="max-w-xl">
        <p className="font-mono text-xs uppercase tracking-[0.24em] text-[var(--blush-dark)]">
          404 · Page not found
        </p>
        <h1 className="mt-5 font-serif text-5xl text-[var(--ink)] sm:text-6xl">
          This page is not part of the lookbook.
        </h1>
        <p className="mt-5 text-base leading-7 text-[var(--muted)]">
          The page may have moved, or the address may be incorrect. Return to the
          studio and find what you need there.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex rounded-full bg-[var(--ink)] px-6 py-3 text-sm font-medium text-white transition hover:bg-[var(--charcoal)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--blush-dark)]"
        >
          Return home
        </Link>
      </div>
    </main>
  );
}
