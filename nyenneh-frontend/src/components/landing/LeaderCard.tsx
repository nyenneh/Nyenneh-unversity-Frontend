import { Mail } from "lucide-react";

import type { Leader } from "@/content/leadership";
import { useReveal } from "@/hooks/useReveal";
import { cn } from "@/lib/utils";

const HONORIFICS = /^(prof|dr|mr|mrs|ms|miss|hon|rev|eng)\.?$/i;

// initials() in lib/utils takes the first two words, so "Prof. Josephine T.
// Wreh" comes out as "PJ". Drop the title and the middle initial here so the
// tile shows the initials someone would actually expect.
function leaderInitials(name: string) {
  const parts = name
    .split(" ")
    .filter(Boolean)
    .filter((part) => !HONORIFICS.test(part))
    // "T." is a middle initial, not a name
    .filter((part) => part.replace(".", "").length > 1);

  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
  return (first + last).toUpperCase();
}

interface LeaderCardProps {
  leader: Leader;
  detailed?: boolean; // full card for the leadership page, not the teaser
  delay?: number; // stagger against the other cards in the row
  className?: string;
}

export function LeaderCard({ leader, detailed = false, delay, className }: LeaderCardProps) {
  const {
    ref: revealRef,
    className: revealClass,
    style: revealStyle,
  } = useReveal<HTMLElement>({ delay });

  return (
    <article
      ref={revealRef}
      style={revealStyle}
      className={cn(
        "flex flex-col rounded-2xl border border-ink-200/70 bg-white p-6 shadow-sm shadow-ink-950/[0.03]",
        className,
        revealClass,
      )}
    >
      <div className="flex items-center gap-4">
        {/* no photos on file yet, so initials on navy/gold beats an empty
            grey circle */}
        <span
          aria-hidden
          className="grid size-14 shrink-0 place-items-center rounded-2xl bg-navy-950 text-base font-semibold tracking-wide text-brand-400"
        >
          {leaderInitials(leader.name)}
        </span>

        <div className="min-w-0">
          <h3 className="font-semibold text-ink-900">{leader.name}</h3>
          <p className="text-sm font-medium text-brand-700">{leader.role}</p>
        </div>
      </div>

      <p className="mt-4 text-xs font-medium uppercase tracking-[0.12em] text-ink-400">
        {leader.unit} · In post since {leader.since}
      </p>

      <p className={cn("mt-3 text-sm/6 text-ink-600", !detailed && "line-clamp-4")}>
        {leader.bio}
      </p>

      {detailed ? (
        <>
          <h4 className="mt-5 text-sm font-semibold text-ink-900">This office decides</h4>
          <ul className="mt-2 space-y-1.5">
            {leader.responsibilities.map((item) => (
              <li key={item} className="flex gap-2.5 text-sm/6 text-ink-600">
                <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-brand-400" />
                {item}
              </li>
            ))}
          </ul>

          <a
            href={`mailto:${leader.email}`}
            className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-brand-700 transition hover:text-brand-600"
          >
            <Mail className="size-4" />
            {leader.email}
          </a>
        </>
      ) : null}
    </article>
  );
}
