import { ArrowRight, Clock, Mail, MapPin, Phone } from "lucide-react";
import { Link } from "react-router-dom";

import { Section, SectionHeading } from "@/components/landing/Section";
import { Reveal } from "@/components/shared/Reveal";
import { campus, offices } from "@/content/contact";
import type { Office } from "@/content/contact";
import { useReveal } from "@/hooks/useReveal";
import { cn } from "@/lib/utils";

function OfficeTile({ office, delay }: { office: Office; delay: number }) {
  const {
    ref: revealRef,
    className: revealClass,
    style: revealStyle,
  } = useReveal<HTMLLIElement>({ delay });

  return (
    <li
      ref={revealRef}
      style={revealStyle}
      className={cn(
        "rounded-2xl border border-ink-200/70 bg-white p-5 shadow-sm shadow-ink-950/[0.03]",
        revealClass,
      )}
    >
      <div className="flex items-center gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-700">
          <office.icon aria-hidden className="size-4" />
        </span>
        <h3 className="font-semibold text-ink-900">{office.name}</h3>
      </div>

      <p className="mt-3 text-sm/6 text-ink-600">{office.handles}</p>

      <div className="mt-4 space-y-1.5 text-sm">
        <a
          href={`mailto:${office.email}`}
          className="block font-medium text-brand-700 transition hover:text-brand-600"
        >
          {office.email}
        </a>
        <a
          href={`tel:${office.phoneDial}`}
          className="block text-ink-600 transition hover:text-ink-900"
        >
          {office.phone}
        </a>
        <p className="text-xs text-ink-500">{office.hours}</p>
      </div>
    </li>
  );
}

export function Contact() {
  // this one is an <li> like its siblings, so use the hook directly instead of
  // <Reveal>, which would wrap it in a div and break the grid
  const {
    ref: ctaRef,
    className: ctaClass,
    style: ctaStyle,
  } = useReveal<HTMLLIElement>({ delay: offices.length * 70 });

  // last thing before the footer, so give it a bit more air
  return (
    <Section id="contact" className="bg-ink-50 py-24 sm:py-28" aria-labelledby="contact-heading">
      <Reveal>
        <SectionHeading
          id="contact-heading"
          eyebrow="Contact"
          title="Come in, call, or write to the right desk"
          description="Enquiries reach us fastest when they go straight to the office that can settle them. Here is who does what."
        />
      </Reveal>

      {/* same reason as the admissions grid: without items-start the navy
          panel stretches down past the office cards */}
      <div className="mt-14 grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
        {/* where we are */}
        <Reveal className="rounded-2xl bg-navy-950 p-8 text-navy-200">
          <h3 className="text-lg font-semibold text-white">Main campus</h3>

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

            <p className="flex items-start gap-3">
              <Phone aria-hidden className="mt-0.5 size-4 shrink-0 text-brand-400" />
              <a className="transition hover:text-white" href={`tel:${campus.switchboardDial}`}>
                {campus.switchboard}
              </a>
            </p>

            <p className="flex items-start gap-3">
              <Mail aria-hidden className="mt-0.5 size-4 shrink-0 text-brand-400" />
              <a className="transition hover:text-white" href={`mailto:${campus.generalEmail}`}>
                {campus.generalEmail}
              </a>
            </p>

            <p className="flex items-start gap-3">
              <Clock aria-hidden className="mt-0.5 size-4 shrink-0 text-brand-400" />
              <span>{campus.openingHours}</span>
            </p>
          </address>

          <a
            href={campus.mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-brand-400 transition hover:text-brand-300"
          >
            Open in maps
            <ArrowRight className="size-4" />
          </a>
        </Reveal>

        {/* who to write to */}
        <div>
          <ul className="grid gap-4 sm:grid-cols-2">
            {offices.map((office, index) => (
              <OfficeTile key={office.id} office={office} delay={index * 70} />
            ))}

            {/* fills the last cell instead of leaving a gap */}
            <li
              ref={ctaRef}
              style={ctaStyle}
              className={cn(
                "flex flex-col justify-center rounded-2xl border border-dashed border-ink-300 p-5",
                ctaClass,
              )}
            >
              <h3 className="font-semibold text-ink-900">Not sure who to ask?</h3>
              <p className="mt-2 text-sm/6 text-ink-600">
                Send one message and we will route it to the right office.
              </p>
              <Link
                to="/contact"
                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-brand-700 transition hover:text-brand-600"
              >
                Write to us
                <ArrowRight className="size-4" />
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </Section>
  );
}
