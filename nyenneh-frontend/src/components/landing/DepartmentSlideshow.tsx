import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { KeyboardEvent, PointerEvent } from "react";

import { departments } from "@/content/departments";
import { cn } from "@/lib/utils";

/** How long a department holds the panel before the next one slides in. */
const INTERVAL_MS = 6000;

/** Horizontal travel, in px, that counts as a swipe rather than a tap. */
const SWIPE_THRESHOLD = 50;

/** Read once at mount: there is no need to react to a mid-visit change. */
function prefersReducedMotion() {
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
}

/**
 * The six departments, one at a time.
 *
 * All six slides stay mounted on a track that is translated sideways, so a move
 * is a single composited transform rather than a mount and unmount per step.
 * The off-screen slides are `inert`, which takes them out of the tab order and
 * out of the accessibility tree — without it a screen reader reads all six
 * departments as one run-on block.
 *
 * It advances on its own but stops the moment the visitor shows any interest: a
 * pointer over the panel, focus inside it, or a press of the pause button.
 * Anyone who has asked their system not to animate never gets auto-advance at
 * all, and moves through the departments by hand.
 */
export function DepartmentSlideshow() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  // A deliberate opt-out, kept apart from `paused` so that moving the pointer
  // off the panel does not restart what the visitor stopped on purpose.
  const [stopped, setStopped] = useState(prefersReducedMotion);

  const count = departments.length;
  const playing = !stopped && !paused;

  const go = useCallback(
    (next: number) => setActive(((next % count) + count) % count),
    [count],
  );

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => setActive((i) => (i + 1) % count), INTERVAL_MS);
    return () => window.clearInterval(timer);
    // `active` is a dependency so that a manual move restarts the countdown,
    // rather than cutting the new slide short with whatever time was left.
  }, [playing, count, active]);

  // Pointer position at the start of a drag, or null when no drag is in flight.
  const swipeStart = useRef<number | null>(null);

  function onPointerDown(event: PointerEvent) {
    // A mouse drag is a text selection, not a swipe. Touch and pen only.
    if (event.pointerType === "mouse") return;
    swipeStart.current = event.clientX;
  }

  function onPointerUp(event: PointerEvent) {
    const start = swipeStart.current;
    swipeStart.current = null;
    if (start === null) return;

    const travelled = event.clientX - start;
    if (Math.abs(travelled) < SWIPE_THRESHOLD) return;
    go(active + (travelled < 0 ? 1 : -1));
  }

  function onKeyDown(event: KeyboardEvent) {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      go(active + 1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      go(active - 1);
    }
  }

  return (
    <div
      role="group"
      aria-roledescription="carousel"
      aria-label="Departments"
      onKeyDown={onKeyDown}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      // React's onFocus and onBlur bubble, so these cover focus anywhere inside.
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div
        className="overflow-hidden rounded-3xl border border-ink-200/70 bg-white shadow-sm shadow-ink-950/[0.04]"
        // Announced only once it is under the visitor's control: a slide nobody
        // asked for should not interrupt whatever is being read.
        aria-live={playing ? "off" : "polite"}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={() => {
          swipeStart.current = null;
        }}
      >
        <div
          className="flex transition-transform duration-500 ease-out motion-reduce:transition-none"
          style={{ transform: `translateX(-${active * 100}%)` }}
        >
          {departments.map((department, index) => (
            <article
              key={department.id}
              inert={index !== active}
              role="group"
              aria-roledescription="slide"
              aria-label={`${index + 1} of ${count}: ${department.name}`}
              className="grid w-full shrink-0 md:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)]"
            >
              {/* Identity on navy, detail on white — the same split the portal
                  uses for a record header and its body. */}
              <div className="flex flex-col justify-between gap-8 bg-navy-950 p-8 sm:p-10">
                <div>
                  <span className="grid size-12 place-items-center rounded-xl bg-white/10 text-brand-400">
                    <department.icon className="size-6" />
                  </span>
                  <h3 className="mt-6 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                    {department.name}
                  </h3>
                  <p className="mt-2 text-sm text-navy-200">{department.faculty}</p>
                </div>

                <dl className="grid grid-cols-3 gap-4 border-t border-white/10 pt-6 text-sm">
                  <div>
                    <dt className="text-xs uppercase tracking-[0.12em] text-navy-300">Code</dt>
                    <dd className="mt-1 font-semibold text-brand-400">{department.code}</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-[0.12em] text-navy-300">Award</dt>
                    <dd className="mt-1 font-medium text-white">{department.award}</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-[0.12em] text-navy-300">Length</dt>
                    <dd className="mt-1 font-medium text-white">{department.duration}</dd>
                  </div>
                </dl>
              </div>

              <div className="flex flex-col p-8 sm:p-10">
                <p className="text-base/7 text-ink-600">{department.blurb}</p>

                <p className="mt-8 text-xs font-semibold uppercase tracking-[0.12em] text-brand-700">
                  Courses you will take
                </p>
                <ul className="mt-3 space-y-2 text-sm text-ink-600">
                  {department.courses.map((course) => (
                    <li key={course} className="flex gap-2">
                      <span
                        aria-hidden
                        className="mt-2 size-1.5 shrink-0 rounded-full bg-brand-500"
                      />
                      {course}
                    </li>
                  ))}
                </ul>

                <p className="mt-auto pt-8 text-xs text-ink-500">
                  Head of department · <span className="text-ink-700">{department.head}</span>
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        {/* Codes rather than dots: at six slides a dot says nothing about where
            it goes, and the codes are what students register under anyway. */}
        <div className="flex flex-wrap gap-2">
          {departments.map((department, index) => (
            <button
              key={department.id}
              type="button"
              onClick={() => go(index)}
              aria-current={index === active}
              aria-label={`Show ${department.name}`}
              className={cn(
                "h-8 rounded-lg px-3 text-xs font-semibold tracking-wide transition",
                index === active
                  ? "bg-navy-950 text-brand-400"
                  : "bg-ink-100 text-ink-600 hover:bg-ink-200 hover:text-ink-900",
              )}
            >
              {department.code}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <p className="mr-1 text-xs tabular-nums text-ink-500">
            {active + 1} / {count}
          </p>

          <button
            type="button"
            onClick={() => setStopped((value) => !value)}
            aria-label={stopped ? "Start automatic slideshow" : "Stop automatic slideshow"}
            className="grid size-9 place-items-center rounded-lg border border-ink-200 text-ink-600 transition hover:bg-ink-50 hover:text-ink-900"
          >
            {stopped ? <Play className="size-4" /> : <Pause className="size-4" />}
          </button>

          <button
            type="button"
            onClick={() => go(active - 1)}
            aria-label="Previous department"
            className="grid size-9 place-items-center rounded-lg border border-ink-200 text-ink-600 transition hover:bg-ink-50 hover:text-ink-900"
          >
            <ChevronLeft className="size-4" />
          </button>

          <button
            type="button"
            onClick={() => go(active + 1)}
            aria-label="Next department"
            className="grid size-9 place-items-center rounded-lg border border-ink-200 text-ink-600 transition hover:bg-ink-50 hover:text-ink-900"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
