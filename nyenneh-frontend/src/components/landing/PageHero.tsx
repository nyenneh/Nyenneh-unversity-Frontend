import type { ReactNode } from "react";

/**
 * The navy band at the top of a public sub-page — the same treatment as the
 * landing hero, without the photograph, so leadership, questions and contact
 * read as parts of one site rather than three loose pages.
 */
export function PageHero({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  /** Optional actions or summary figures under the copy. */
  children?: ReactNode;
}) {
  return (
    <div className="relative overflow-hidden bg-navy-950">
      {/* Gold wash and faint grid — the brand treatment shared with the hero. */}
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(70%_60%_at_15%_0%,rgba(210,154,21,0.2),transparent)]"
      />
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.05] [background-image:linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] [background-size:64px_64px]"
      />

      <div className="relative z-10 mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-300">
          {eyebrow}
        </p>
        <h1 className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
          {title}
        </h1>
        <p className="mt-5 max-w-2xl text-base/7 text-navy-200">{description}</p>

        {children}
      </div>
    </div>
  );
}
