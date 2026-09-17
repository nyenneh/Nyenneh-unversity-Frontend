import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

import { LeaderCard } from "@/components/landing/LeaderCard";
import { PageHero } from "@/components/landing/PageHero";
import { Section, SectionHeading } from "@/components/landing/Section";
import { Reveal } from "@/components/shared/Reveal";
import { council, deans, principalOfficers } from "@/content/leadership";

// Who runs the place, in the order the statutes put them: principal officers,
// then deans, then the council they all answer to.
export default function LeadershipPage() {
  return (
    <>
      <PageHero
        eyebrow="Leadership"
        title="Who runs Nyenneh University"
        description="Every office below has a name, a remit and an email address. Writing to the desk that can actually settle your business is the fastest way to get an answer."
      />

      <Section aria-labelledby="officers-heading">
        <Reveal>
          <SectionHeading
            id="officers-heading"
            eyebrow="Principal officers"
            title="The management team"
            description="Appointed by the University Council, and responsible to it for the running of the university day to day."
          />
        </Reveal>

        <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {principalOfficers.map((leader, index) => (
            <LeaderCard key={leader.id} leader={leader} detailed delay={(index % 3) * 90} />
          ))}
        </div>
      </Section>

      <Section className="bg-ink-50" aria-labelledby="deans-heading">
        <Reveal>
          <SectionHeading
            id="deans-heading"
            eyebrow="Faculties"
            title="Deans"
            description="Each faculty is led by a dean, who chairs its examination board and answers for its programmes. Departmental heads sit under them."
          />
        </Reveal>

        <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {deans.map((leader, index) => (
            <LeaderCard key={leader.id} leader={leader} detailed delay={index * 90} />
          ))}
        </div>
      </Section>

      <Section aria-labelledby="council-heading">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <Reveal>
            <SectionHeading
              id="council-heading"
              eyebrow="Governance"
              title="The University Council"
              description="The governing body. It appoints the principal officers, approves the budget and the fee structure, and holds the Vice-Chancellor to account. It meets quarterly, and the Registrar is its secretary."
            />
          </Reveal>

          <Reveal delay={90}>
            <ul className="divide-y divide-ink-200/70 overflow-hidden rounded-2xl border border-ink-200/70 bg-white">
              {council.map((member) => (
                <li
                  key={member.name}
                  className="flex flex-col gap-1 px-5 py-4 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6 sm:px-6"
                >
                  <span className="font-medium text-ink-900">{member.name}</span>
                  <span className="text-sm text-ink-500 sm:text-right">{member.role}</span>
                </li>
              ))}
            </ul>

            <p className="mt-4 text-sm/6 text-ink-500">
              Council business goes through the Registrar rather than to members
              directly.
            </p>
          </Reveal>
        </div>
      </Section>

      {/* gold band to close, same as the landing page */}
      <div className="bg-brand-500">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <Reveal className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-semibold tracking-tight text-navy-950 sm:text-4xl">
                Not sure whose desk it is?
              </h2>
              <p className="mt-3 text-base/7 text-navy-900/80">
                Most questions are settled by the registry, the bursary or the
                helpdesk long before they reach an officer.
              </p>
            </div>

            <div className="flex shrink-0 flex-wrap gap-3">
              <Link
                to="/questions"
                className="inline-flex h-11 items-center gap-2 rounded-lg bg-navy-950 px-6 text-sm font-medium text-white transition hover:bg-navy-900"
              >
                Read the answers first
                <ArrowRight className="size-4" />
              </Link>
              <Link
                to="/contact"
                className="inline-flex h-11 items-center gap-2 rounded-lg border border-navy-950/20 px-6 text-sm font-medium text-navy-950 transition hover:bg-navy-950/10"
              >
                Contact an office
              </Link>
            </div>
          </Reveal>
        </div>
      </div>
    </>
  );
}
