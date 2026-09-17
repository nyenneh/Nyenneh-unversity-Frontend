import { useEffect, useState } from "react";

interface TypewriterOptions {
  typeMs?: number; // per character going in
  deleteMs?: number; // per character coming back out - faster, nobody reads a deletion
  holdMs?: number; // how long a finished line sits before it clears
}

// the empty beat between one quote clearing and the next starting
const GAP_MS = 500;

function prefersReducedMotion() {
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
}

// Types one line out, holds it, deletes it, moves to the next, forever.
//
//   const { text, author, done } = useTypewriter(lines.map((l) => l.text));
//
// `lines` has to be a stable array - keep it at module scope, or memo it, or
// the timer restarts on every render and nothing ever finishes typing.
//
// Reduced motion gets the first line in full and no rotation, the same deal the
// hero photos get.
export function useTypewriter(lines: string[], options: TypewriterOptions = {}) {
  const { typeMs = 45, deleteMs = 20, holdMs = 2600 } = options;

  const [index, setIndex] = useState(0);
  const [shown, setShown] = useState(0); // characters currently on screen
  const [deleting, setDeleting] = useState(false);

  // read once at mount, like the hero slideshow does
  const [still] = useState(prefersReducedMotion);

  const line = lines[index] ?? "";

  useEffect(() => {
    if (still || lines.length === 0) return;

    const current = lines[index] ?? "";

    // typed to the end - sit there and let it be read
    if (!deleting && shown === current.length) {
      const timer = window.setTimeout(() => setDeleting(true), holdMs);
      return () => window.clearTimeout(timer);
    }

    // deleted back to nothing - a beat of empty line, then the next one starts.
    // both setStates go in the timeout: doing them here in the effect body is a
    // cascading render, and the lint rule is right to stop it.
    if (deleting && shown === 0) {
      const timer = window.setTimeout(() => {
        setDeleting(false);
        setIndex((i) => (i + 1) % lines.length);
      }, GAP_MS);
      return () => window.clearTimeout(timer);
    }

    const timer = window.setTimeout(
      () => setShown((count) => count + (deleting ? -1 : 1)),
      deleting ? deleteMs : typeMs,
    );
    return () => window.clearTimeout(timer);
  }, [still, lines, index, shown, deleting, typeMs, deleteMs, holdMs]);

  return {
    index,
    text: still ? line : line.slice(0, shown),
    full: line, // the whole line, for the copy screen readers get
    // the attribution waits for the quote to finish, otherwise it credits
    // someone with half a sentence
    done: still || (!deleting && shown === line.length),
  };
}
