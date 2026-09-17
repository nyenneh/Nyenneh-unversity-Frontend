import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

import { LeaderCard } from "@/components/landing/LeaderCard";
import { Section, SectionHeading } from "@/components/landing/Section";
import { Reveal } from "@/components/shared/Reveal";
import { principalOfficers } from "@/content/leadership";

// the three offices a student actually deals with, in precedence order
const featured = principalOfficers.slice(0, 3);
const rest = principalOfficers.slice(3);

export function Leadership() {
  return (
    <Section id="leadership" width="narrow" className="bg-ink-50" aria-labelledby="leadership-heading">
      <Reveal>
        <SectionHeading
          id="leadership-heading"
          eyebrow="Leadership"
          title="The people accountable for your degree"
          description="A small management team, each with a named office and a published email. If a decision about your studies has to be made, one of these desks makes it."
        />
      </Reveal>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {featured.map((leader, index) => (
          <LeaderCard key={leader.id} leader={leader} delay={index * 90} />
        ))}
      </div>

      {/* the rest as a compact roll - keeps the section short without hiding
          half the management team behind a link */}
      <dl className="mt-6 grid gap-px overflow-hidden rounded-2xl border border-ink-200/70 bg-ink-200/70 sm:grid-cols-3">
        {rest.map((leader, index) => (
          <Reveal key={leader.id} delay={index * 70} className="bg-white p-5">
            <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-700">
              {leader.role}
            </dt>
            <dd className="mt-1.5 text-sm font-medium text-ink-900">{leader.name}</dd>
          </Reveal>
        ))}
      </dl>

      <Reveal className="mt-10">
        <Link
          to="/leadership"
          className="inline-flex items-center gap-2 text-sm font-semibold text-brand-700 transition hover:text-brand-600"
        >
          Deans, the University Council and who to write to
          <ArrowRight className="size-4" />
        </Link>
      </Reveal>
    </Section>
  );
}
