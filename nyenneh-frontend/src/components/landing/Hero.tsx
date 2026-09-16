import { ArrowRight, GraduationCap } from "lucide-react";
import { lazy, Suspense, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { buttonClasses } from "@/components/ui/buttonStyles";
import { heroSlides } from "@/content/heroSlides";
import { cn } from "@/lib/utils";

// The dialog drags in react-hook-form and zod for a form most visitors never
// open, so it loads on demand.
const ApplyModal = lazy(() =>
  import("@/components/landing/ApplyModal").then((module) => ({ default: module.ApplyModal })),
);

/** Warm the chunk while the pointer is still travelling to the button. */
function preloadApplyModal() {
  void import("@/components/landing/ApplyModal");
}

/** How long a photograph holds the frame before the next one fades up. */
const SLIDE_MS = 7000;

/** Read once at mount: there is no need to react to a mid-visit change. */
function prefersReducedMotion() {
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
}

export function Hero() {
  const [applyOpen, setApplyOpen] = useState(false);
  const [active, setActive] = useState(0);

  // Anyone who has asked their system not to animate keeps the first frame and
  // never gets the rotation — a background that moves on its own is exactly
  // what that setting is about.
  const [still] = useState(prefersReducedMotion);

  // The later photographs are held back until the browser is idle, so they do
  // not compete for bandwidth with the first one, which is the page's LCP.
  const [restLoaded, setRestLoaded] = useState(false);

  useEffect(() => {
    if (still) return;

    const idle = window.requestIdleCallback;
    if (idle) {
      const handle = idle(() => setRestLoaded(true), { timeout: 2500 });
      return () => window.cancelIdleCallback?.(handle);
    }

    // Safari has no requestIdleCallback; a timer past the usual first paint
    // does the same job well enough.
    const timer = window.setTimeout(() => setRestLoaded(true), 1500);
    return () => window.clearTimeout(timer);
  }, [still]);

  useEffect(() => {
    if (still || heroSlides.length < 2) return;
    const timer = window.setInterval(
      () => setActive((index) => (index + 1) % heroSlides.length),
      SLIDE_MS,
    );
    return () => window.clearInterval(timer);
    // `active` is a dependency so that picking a photograph by hand restarts
    // the countdown rather than cutting the new one short.
  }, [still, active]);

  const slide = heroSlides[active];

  return (
    <div className="relative overflow-hidden bg-navy-950">
      {/* Liberia, full bleed behind the headline: the coast, the capital and
          the interior, one fading into the next. Decorative — the message is
          carried by the heading — so the alt text stays empty and the place
          names live in the caption under the copy instead.

          The first frame is deliberately eager: it is the largest thing above
          the fold, so it is the page's LCP element. Making it lazy would delay
          first paint rather than help it. */}
      <div aria-hidden className="absolute inset-0">
        {heroSlides.map((item, index) => {
          const first = index === 0;
          if (!first && !restLoaded && index !== active) return null;

          return (
            <img
              key={item.id}
              src={item.src}
              alt=""
              loading={first ? "eager" : "lazy"}
              fetchPriority={first ? "high" : "low"}
              decoding="async"
              className={cn(
                // A slow drift on every frame, not just the visible one: a
                // photograph that stopped moving as it faded out would snap.
                "absolute inset-0 size-full animate-hero-pan object-cover object-center",
                "transition-opacity duration-1000 ease-linear motion-reduce:animate-none motion-reduce:transition-none",
                index === active ? "opacity-100" : "opacity-0",
              )}
            />
          );
        })}
      </div>

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
            Six departments · Semester-based credit system · Results published online
          </p>
        </div>

        {/* Where the photograph was taken, and who took it. The credit is a
            licence condition, so it stays visible at every width rather than
            being tucked away on large screens. The dots are a shortcut for
            anyone who does not want to wait out the rotation. */}
        <div className="mt-14 flex flex-wrap items-center gap-x-4 gap-y-3 sm:mt-20">
          <div className="flex items-center gap-2">
            {heroSlides.map((item, index) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActive(index)}
                aria-current={index === active}
                aria-label={`Show ${item.place}`}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  index === active
                    ? "w-8 bg-brand-400"
                    : "w-4 bg-white/35 hover:bg-white/60",
                )}
              />
            ))}
          </div>

          <p className="text-xs text-navy-300">
            {slide.place} · Photo{" "}
            <a
              href={slide.source}
              target="_blank"
              rel="noreferrer"
              className="underline decoration-navy-400 underline-offset-2 transition hover:text-navy-100"
            >
              {slide.credit}
            </a>{" "}
            / Wikimedia Commons, {slide.licence}
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
