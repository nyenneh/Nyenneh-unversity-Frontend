import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface SectionProps {
  /** Anchor target for the header nav links. */
  id?: string;
  className?: string;
  children: ReactNode;
  /** Labels the section for screen readers when it has no visible heading. */
  "aria-label"?: string;
  "aria-labelledby"?: string;
}

/** Full-bleed band with the shared public-page gutter and vertical rhythm. */
export function Section({ id, className, children, ...aria }: SectionProps) {
  return (
    <section id={id} className={cn("py-20 sm:py-24", className)} {...aria}>
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">{children}</div>
    </section>
  );
}

interface SectionHeadingProps {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  /** Dark bands invert the type colours instead of shipping a second component. */
  tone?: "light" | "dark";
  align?: "left" | "center";
  id?: string;
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  tone = "light",
  align = "left",
  id,
  className,
}: SectionHeadingProps) {
  const dark = tone === "dark";

  return (
    <div
      className={cn(
        "max-w-2xl",
        align === "center" && "mx-auto text-center",
        className,
      )}
    >
      {eyebrow ? (
        <p
          className={cn(
            "text-xs font-semibold uppercase tracking-[0.18em]",
            dark ? "text-brand-300" : "text-brand-700",
          )}
        >
          {eyebrow}
        </p>
      ) : null}

      <h2
        id={id}
        className={cn(
          "mt-3 text-3xl font-semibold tracking-tight sm:text-4xl",
          dark ? "text-white" : "text-ink-900",
        )}
      >
        {title}
      </h2>

      {description ? (
        <p className={cn("mt-4 text-base/7", dark ? "text-navy-200" : "text-ink-600")}>
          {description}
        </p>
      ) : null}
    </div>
  );
}
