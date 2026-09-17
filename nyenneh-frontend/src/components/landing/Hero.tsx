import { ArrowRight, GraduationCap } from "lucide-react";
import { lazy, Suspense, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { buttonClasses } from "@/components/ui/buttonStyles";
import { educationQuotes } from "@/content/quotes";
import { heroSlides } from "@/content/heroSlides";
import { useTypewriter } from "@/hooks/useTypewriter";
import { cn } from "@/lib/utils";

// lazy: this pulls in react-hook-form and zod for a form most visitors never open
const ApplyModal = lazy(() =>
  import("@/components/landing/ApplyModal").then((module) => ({ default: module.ApplyModal })),
);

// start fetching it while the mouse is still moving towards the button
function preloadApplyModal() {
  void import("@/components/landing/ApplyModal");
}

const SLIDE_MS = 7000;

function prefersReducedMotion() {
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
}

// module scope: useTypewriter needs the same array every render
const quoteLines = educationQuotes.map((quote) => quote.text);

// One quote at a time, typed out, held, cleared, next. The animated copy is
// hidden from assistive tech - a half-typed sentence read out character by
// character is noise - and the whole quote sits next to it for screen readers.
function TypedQuote() {
  const { index, text, full, done } = useTypewriter(quoteLines);
  const author = educationQuotes[index].author;

  return (
    <figure className="mt-10 max-w-xl border-l-2 border-brand-400/60 pl-5">
      {/* fixed height, or the photo credit below jumps every time the quote
          wraps onto another line */}
      <blockquote className="min-h-24 sm:min-h-16">
        <p aria-hidden className="text-base/7 italic text-navy-100 sm:text-lg/8">
          &ldquo;{text}&rdquo;
          <span
            aria-hidden
            className="ml-1 inline-block h-[1em] w-0.5 translate-y-[0.15em] animate-caret bg-brand-400 motion-reduce:hidden"
          />
        </p>
        <p className="sr-only">
          &ldquo;{full}&rdquo; — {author}
        </p>
      </blockquote>

      {/* only once the sentence is whole, so nobody is credited with half of it */}
      <figcaption
        aria-hidden
        className={cn(
          "mt-2 text-sm font-medium text-brand-300 transition-opacity duration-500",
          done ? "opacity-100" : "opacity-0",
        )}
      >
        — {author}
      </figcaption>
    </figure>
  );
}

export function Hero() {
  const [applyOpen, setApplyOpen] = useState(false);
  const [active, setActive] = useState(0);

  // reduced motion = keep the first photo, no rotation. read once at mount
  const [still] = useState(prefersReducedMotion);

  // hold the other photos back until the browser is idle so they don't fight
  // the first one for bandwidth (that one is the LCP)
  const [restLoaded, setRestLoaded] = useState(false);

  useEffect(() => {
    if (still) return;

    const idle = window.requestIdleCallback;
    if (idle) {
      const handle = idle(() => setRestLoaded(true), { timeout: 2500 });
      return () => window.cancelIdleCallback?.(handle);
    }

    // safari still has no requestIdleCallback
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
    // `active` is in the deps on purpose so clicking a dot restarts the timer
  }, [still, active]);

  const slide = heroSlides[active];

  return (
    <div className="relative overflow-hidden bg-navy-950">
      {/* Campus buildings behind the headline. Decorative, so alt is empty -
          the captions are below. First one is eager on purpose, it's the LCP
          element. */}
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
                // every frame pans, not just the visible one, otherwise a photo
                // that stopped moving while fading out snaps
                "absolute inset-0 size-full animate-hero-pan object-cover object-center",
                "transition-opacity duration-1000 ease-linear motion-reduce:animate-none motion-reduce:transition-none",
                index === active ? "opacity-100" : "opacity-0",
              )}
            />
          );
        })}
      </div>

      {/* two overlays: one darkens everything so the copy reads on phones, the
          other fades left to right so the text column stays navy on desktop */}
      <div aria-hidden className="absolute inset-0 bg-navy-950/45 lg:bg-navy-950/20" />
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(100deg,#0d1b3e_0%,rgba(13,27,62,0.9)_32%,rgba(13,27,62,0.6)_58%,rgba(13,27,62,0.2)_100%)]"
      />

      {/* gold wash + faint grid, same as the login panel */}
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

          <TypedQuote />
        </div>

        {/* Photo credit. The licence requires it, so it shows at every width,
            we can't hide it on mobile. */}
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
