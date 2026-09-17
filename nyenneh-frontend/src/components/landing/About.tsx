import { ArrowRight, Award, BookOpen, Compass } from "lucide-react";
import { Link } from "react-router-dom";

import { Section, SectionHeading } from "@/components/landing/Section";
import { Reveal } from "@/components/shared/Reveal";
import { buttonClasses } from "@/components/ui/buttonStyles";
import { campus } from "@/content/contact";
import { departments, facultyCount } from "@/content/departments";
import { useReveal } from "@/hooks/useReveal";
import { cn } from "@/lib/utils";

// The crest, full size. It carries the motto the three pillars below spell
// out, which is why this section shows it rather than reusing <Logo />.
import crest from "@/assets/university-image/Nyenneh university.jpg";

// TODO: the founding year is a placeholder, like the stats band in Academics,
// and so is the bit of history in the copy below - swap both for what the
// university actually publishes. The faculty and department counts are derived
// so they cannot drift away from the slideshow.
const facts = [
  { label: "Founded", value: "2009" },
  { label: "Campus", value: campus.line2 },
  { label: "Faculties", value: String(facultyCount) },
  { label: "Departments", value: String(departments.length) },
];

// the three words printed under the crest, said properly
const pillars = [
  {
    icon: Award,
    title: "Excellence",
    body: "External examiners sit on every final-year board, and results are published to the portal the week they are approved — not the month after.",
  },
  {
    icon: BookOpen,
    title: "Knowledge",
    body: "Six departments on one semester credit system, taught by staff who are in the building and reachable by email, not by appointment slip.",
  },
  {
    icon: Compass,
    title: "Leadership",
    body: "Every office that can decide something about your studies is named and published, from the Vice-Chancellor down to the bursary desk.",
  },
];

// <figure> because the crest and the motto under it are one thing
function Crest() {
  const {
    ref: revealRef,
    className: revealClass,
    style: revealStyle,
  } = useReveal<HTMLElement>({ delay: 120 });

  return (
    <figure
      ref={revealRef}
      style={revealStyle}
      className={cn(
        "rounded-2xl border border-ink-200/70 bg-white p-8 shadow-sm shadow-ink-950/[0.03] sm:p-10",
        revealClass,
      )}
    >
      <img
        src={crest}
        alt="The Nyenneh University crest: a lit torch over an open book, framed by a laurel wreath."
        loading="lazy"
        decoding="async"
        className="mx-auto w-full max-w-xs object-contain"
      />
      <figcaption className="mt-6 border-t border-ink-200/70 pt-6 text-center text-sm/6 text-ink-600">
        Excellence · Knowledge · Leadership — the motto on the seal, and the order
        the university puts them in.
      </figcaption>
    </figure>
  );
}

// the reveal goes on the <li> itself - wrapping it in a div would make the div
// the grid item and the row would break
function Pillar({ pillar, index }: { pillar: (typeof pillars)[number]; index: number }) {
  const {
    ref: revealRef,
    className: revealClass,
    style: revealStyle,
  } = useReveal<HTMLLIElement>({ delay: index * 90 });

  return (
    <li
      ref={revealRef}
      style={revealStyle}
      className={cn(
        "rounded-2xl border border-ink-200/70 bg-white p-6 shadow-sm shadow-ink-950/[0.03]",
        revealClass,
      )}
    >
      <span className="grid size-11 place-items-center rounded-xl bg-brand-50 text-brand-700">
        <pillar.icon className="size-5" />
      </span>
      <h3 className="mt-5 font-semibold text-ink-900">{pillar.title}</h3>
      <p className="mt-2 text-sm/6 text-ink-600">{pillar.body}</p>
    </li>
  );
}

export function About() {
  return (
    // sits on the page background, between the navy hero and the gold stats
    // band, so the three bands either side of it stay distinct
    <Section id="about" className="py-24 sm:py-28" aria-labelledby="about-heading">
      <div className="grid gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
        <div>
          <Reveal>
            <SectionHeading
              id="about-heading"
              eyebrow="About us"
              title="A Liberian university that keeps its records where students can reach them"
              description="Nyenneh University teaches computing, business and engineering from a single campus on Tubman Boulevard, and runs the whole academic year — registration, schedules, results, fees — through one portal."
            />
          </Reveal>

          <Reveal className="mt-8 max-w-2xl space-y-5 text-base/7 text-ink-600">
            <p>
              The university opened with two departments and a filing room. It now
              admits into six, across {facultyCount} faculties, on a semester credit
              system where a course you pass counts the same wherever you take it.
              What has not changed is the size: courses cap at sixty and tutorials at
              twenty, because a lecturer who knows your name marks your work better.
            </p>
            <p>
              The second thing that changed was the filing room. Every registration,
              mark and invoice now lives in the student portal, so a transcript is a
              page you open rather than a queue you join. The paperwork should never
              be the hard part of your degree.
            </p>
          </Reveal>

          <Reveal className="mt-10">
            <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-ink-200/70 bg-ink-200/70 sm:grid-cols-4">
              {facts.map((fact) => (
                <div key={fact.label} className="bg-white p-5">
                  <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-700">
                    {fact.label}
                  </dt>
                  <dd className="mt-1.5 text-sm font-semibold text-ink-900">{fact.value}</dd>
                </div>
              ))}
            </dl>
          </Reveal>

          <Reveal>
            <Link
              to="/leadership"
              className={buttonClasses({ variant: "outline", className: "mt-8" })}
            >
              Meet the leadership
              <ArrowRight className="size-4" />
            </Link>
          </Reveal>
        </div>

        <Crest />
      </div>

      <ul className="mt-16 grid gap-6 md:grid-cols-3">
        {pillars.map((pillar, index) => (
          <Pillar key={pillar.title} pillar={pillar} index={index} />
        ))}
      </ul>
    </Section>
  );
}
