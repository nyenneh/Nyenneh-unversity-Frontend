import { Clock, ExternalLink, Mail, MapPin, Phone } from "lucide-react";
import { Link } from "react-router-dom";

import { EnquiryForm } from "@/components/landing/EnquiryForm";
import { PageHero } from "@/components/landing/PageHero";
import { Section, SectionHeading } from "@/components/landing/Section";
import { Reveal } from "@/components/shared/Reveal";
import { campus, enquiryTopics, offices } from "@/content/contact";
import type { Office } from "@/content/contact";
import { useReveal } from "@/hooks/useReveal";
import { cn } from "@/lib/utils";

function OfficeCard({ office, delay }: { office: Office; delay: number }) {
  const {
    ref: revealRef,
    className: revealClass,
    style: revealStyle,
  } = useReveal<HTMLElement>({ delay });

  return (
    <article
      ref={revealRef}
      style={revealStyle}
      id={office.id}
      className={cn(
        "flex scroll-mt-24 flex-col rounded-2xl border border-ink-200/70 bg-white p-6 shadow-sm shadow-ink-950/[0.03]",
        revealClass,
      )}
    >
      <span className="grid size-11 place-items-center rounded-xl bg-brand-50 text-brand-700">
        <office.icon aria-hidden className="size-5" />
      </span>

      <h3 className="mt-5 font-semibold text-ink-900">{office.name}</h3>
      <p className="mt-2 flex-1 text-sm/6 text-ink-600">{office.handles}</p>

      <dl className="mt-5 space-y-2.5 border-t border-ink-100 pt-5 text-sm">
        <div className="flex items-start gap-3">
          <dt className="sr-only">Email</dt>
          <Mail aria-hidden className="mt-0.5 size-4 shrink-0 text-ink-400" />
          <dd>
            <a
              href={`mailto:${office.email}`}
              className="font-medium text-brand-700 transition hover:text-brand-600"
            >
              {office.email}
            </a>
          </dd>
        </div>

        <div className="flex items-start gap-3">
          <dt className="sr-only">Telephone</dt>
          <Phone aria-hidden className="mt-0.5 size-4 shrink-0 text-ink-400" />
          <dd>
            <a
              href={`tel:${office.phoneDial}`}
              className="text-ink-700 transition hover:text-ink-900"
            >
              {office.phone}
            </a>
          </dd>
        </div>

        <div className="flex items-start gap-3">
          <dt className="sr-only">Opening hours</dt>
          <Clock aria-hidden className="mt-0.5 size-4 shrink-0 text-ink-400" />
          <dd className="text-ink-500">{office.hours}</dd>
        </div>
      </dl>
    </article>
  );
}

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Talk to the office that can settle it"
        description="Five offices handle almost everything a student or an applicant needs. Write to the right one and you skip a forwarding step."
      >
        <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3 text-sm text-navy-200">
          <span className="inline-flex items-center gap-2">
            <Phone aria-hidden className="size-4 text-brand-400" />
            <a className="transition hover:text-white" href={`tel:${campus.switchboardDial}`}>
              {campus.switchboard}
            </a>
          </span>
          <span className="inline-flex items-center gap-2">
            <Mail aria-hidden className="size-4 text-brand-400" />
            <a className="transition hover:text-white" href={`mailto:${campus.generalEmail}`}>
              {campus.generalEmail}
            </a>
          </span>
          <span className="inline-flex items-center gap-2">
            <Clock aria-hidden className="size-4 text-brand-400" />
            {campus.openingHours}
          </span>
        </div>
      </PageHero>

      {/* one card per office, saying what it actually decides */}
      <Section id="offices" aria-labelledby="offices-heading">
        <Reveal>
          <SectionHeading
            id="offices-heading"
            eyebrow="Offices"
            title="Who handles what"
            description="If you are not sure, the registry will point you to the right desk — but going direct is faster."
          />
        </Reveal>

        <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {offices.map((office, index) => (
            <OfficeCard key={office.id} office={office} delay={(index % 3) * 90} />
          ))}
        </div>

        <p className="mt-8 text-sm/6 text-ink-500">{campus.closedNote}</p>
      </Section>

      {/* write to us, and where to find us */}
      <Section id="write" className="bg-ink-50" aria-labelledby="write-heading">
        <div className="grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
          <div>
            <Reveal>
              <SectionHeading
                id="write-heading"
                eyebrow="Send a message"
                title="Write to us"
                description="One message, routed to the office that handles it. Include your roll number if you are already a student — it is how we find your record."
              />
            </Reveal>

            <Reveal delay={90}>
              <EnquiryForm
                email={campus.generalEmail}
                topics={enquiryTopics}
                subject="Enquiry from the Nyenneh University website"
                askRollNumber
              />
            </Reveal>
          </div>

          <div>
            <Reveal className="rounded-2xl bg-navy-950 p-8 text-navy-200">
              <h3 className="text-lg font-semibold text-white">Find the campus</h3>

              <address className="mt-5 space-y-4 text-sm/6 not-italic">
                <p className="flex items-start gap-3">
                  <MapPin aria-hidden className="mt-0.5 size-4 shrink-0 text-brand-400" />
                  <span>
                    {campus.line1}
                    <br />
                    {campus.line2}
                    <br />
                    {campus.country}
                  </span>
                </p>
              </address>

              <a
                href={campus.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-brand-400 transition hover:text-brand-300"
              >
                Open in maps
                <ExternalLink className="size-4" />
              </a>

              <p className="mt-6 border-t border-white/10 pt-6 text-sm/6">
                The main gate is on Tubman Boulevard. Visitors sign in at the security
                post and are directed from there.
              </p>
            </Reveal>

            <Reveal delay={90} className="mt-6 rounded-2xl border border-ink-200/70 bg-white p-6">
              <h3 className="font-semibold text-ink-900">Try the answers first</h3>
              <p className="mt-2 text-sm/6 text-ink-600">
                Registration, fees, results and sign-in problems are answered in full
                on the questions page — usually faster than waiting for a reply.
              </p>
              <Link
                to="/questions"
                className="mt-4 inline-block text-sm font-semibold text-brand-700 transition hover:text-brand-600"
              >
                Read the answers
              </Link>
            </Reveal>
          </div>
        </div>
      </Section>
    </>
  );
}
