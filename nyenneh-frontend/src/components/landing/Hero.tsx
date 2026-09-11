import { ArrowRight, GraduationCap } from "lucide-react";
import { lazy, Suspense, useState } from "react";
import { Link } from "react-router-dom";

import campusHero from "@/assets/campus-hero.jpg";
import { buttonClasses } from "@/components/ui/buttonStyles";

// The dialog drags in react-hook-form and zod for a form most visitors never
// open, so it loads on demand.
const ApplyModal = lazy(() =>
  import("@/components/landing/ApplyModal").then((module) => ({ default: module.ApplyModal })),
);

/** Warm the chunk while the pointer is still travelling to the button. */
function preloadApplyModal() {
  void import("@/components/landing/ApplyModal");
}

export function Hero() {
  const [applyOpen, setApplyOpen] = useState(false);

  return (
    <div className="relative overflow-hidden bg-navy-950">
      {/* Graduation photograph, full bleed behind the headline. Decorative —
          the message is carried by the heading, so the alt text stays empty.
          Source: unsplash.com/photos/photo-1541339907198-e08756dedf3f

          Deliberately eager: this is the largest thing above the fold, so it
          is the page's LCP element. Making it lazy would delay first paint
          rather than help it. */}
      <img
        src={campusHero}
        alt=""
        aria-hidden
        loading="eager"
        fetchPriority="high"
        decoding="async"
        className="absolute inset-0 size-full object-cover object-center"
      />

      {/* Scrims. The first darkens the whole frame so the copy stays legible on
          phones, where text runs the full width; the second is the horizontal
          fade that keeps the left column near-solid navy on wide screens. */}
      <div aria-hidden className="absolute inset-0 bg-navy-950/45 lg:bg-navy-950/20" />
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(100deg,#0d1b3e_0%,rgba(13,27,62,0.9)_32%,rgba(13,27,62,0.6)_58%,rgba(13,27,62,0.2)_100%)]"
      />

      {/* Gold wash and faint grid — the same brand treatment as the login panel. */}
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(70%_55%_at_15%_0%,rgba(210,154,21,0.22),transparent)]"
      />
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.05] [background-image:linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] [background-size:64px_64px]"
      />

      <div className="relative z-10 mx-auto w-full max-w-6xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8 lg:py-40">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-400/30 bg-brand-400/10 px-3 py-1 text-xs font-medium text-brand-200 backdrop-blur-sm">
            <GraduationCap className="size-3.5" />
            Admissions open for the 2026/2027 session
          </span>

          <h1 className="mt-6 text-4xl font-semibold leading-[1.1] tracking-tight text-white drop-shadow-lg drop-shadow-navy-950/50 sm:text-5xl lg:text-6xl">
            Study here.
            <span className="block text-brand-400">Lead anywhere.</span>
          </h1>

          <p className="mt-6 max-w-xl text-lg/8 text-navy-100">
            Nyenneh University teaches computing, business and engineering to a
            generation that expects its university to keep up. Registration,
            schedules, results and fees all live in one portal — no queues, no
            paper files, no lost forms.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link
              to="/login"
              className={buttonClasses({ size: "lg", className: "shadow-lg shadow-brand-500/20" })}
            >
              Enter the student portal
              <ArrowRight className="size-4" />
            </Link>
            <button
              type="button"
              onClick={() => setApplyOpen(true)}
              onPointerEnter={preloadApplyModal}
              onFocus={preloadApplyModal}
              className={buttonClasses({
                variant: "outline",
                size: "lg",
                className:
                  "border-white/30 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20",
              })}
            >
              How to apply
            </button>
          </div>

          <p className="mt-6 text-sm text-navy-200">
            Three faculties · Semester-based credit system · Results published online
          </p>
        </div>
      </div>

      {applyOpen ? (
        <Suspense fallback={null}>
          <ApplyModal open onClose={() => setApplyOpen(false)} />
        </Suspense>
      ) : null}
    </div>
  );
}
