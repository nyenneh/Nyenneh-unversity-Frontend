import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

// How wide the content column runs. Most sections are happy on the default.
// The department slideshow wants the extra room; the sections that are really
// just a column of text read better held in a bit.
const widths = {
  narrow: "max-w-5xl",
  default: "max-w-6xl",
  wide: "max-w-7xl",
};

interface SectionProps {
  id?: string; // anchor target for the header nav links
  className?: string;
  children: ReactNode;
  width?: keyof typeof widths;
  // for a section with no visible heading
  "aria-label"?: string;
  "aria-labelledby"?: string;
}

// Full-bleed band with the gutter the public pages share. The vertical padding
// here is only a starting point - sections override it so the page does not
// march down at one fixed beat.
export function Section({ id, className, children, width = "default", ...aria }: SectionProps) {
  return (
    <section id={id} className={cn("py-20 sm:py-24", className)} {...aria}>
      <div className={cn("mx-auto w-full px-4 sm:px-6 lg:px-8", widths[width])}>{children}</div>
    </section>
  );
}

interface SectionHeadingProps {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  // dark flips the text colours rather than us having a second component
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
