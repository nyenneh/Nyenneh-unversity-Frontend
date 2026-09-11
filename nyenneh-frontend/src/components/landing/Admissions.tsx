import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

import { Section, SectionHeading } from "@/components/landing/Section";
import { buttonClasses } from "@/components/ui/buttonStyles";

const steps = [
  {
    title: "Apply online",
    body: "Submit your senior secondary results, a valid ID and your programme of choice. The registry reviews applications on a rolling basis.",
  },
  {
    title: "Receive your roll number",
    body: "Admitted students get a roll number and a temporary portal password by email — the portal asks you to change it on first sign-in.",
  },
  {
    title: "Register and pay",
    body: "Pick your courses for the semester, clear your tuition at the bursary or by transfer, and your schedule appears in the portal.",
  },
];

const dates = [
  { label: "Applications close", value: "31 October" },
  { label: "Registration opens", value: "10 November" },
  { label: "Semester begins", value: "24 November" },
];

export function Admissions() {
  return (
    <Section id="admissions" aria-labelledby="admissions-heading">
      <div className="grid gap-14 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <SectionHeading
            id="admissions-heading"
            eyebrow="Admissions"
            title="Three steps from applicant to enrolled"
            description="No forms to collect in person and nothing to submit twice. Everything after admission happens in the portal."
          />

          <ol className="mt-10 space-y-8">
            {steps.map((step, index) => (
              <li key={step.title} className="flex gap-5">
                <span
                  aria-hidden
                  className="grid size-10 shrink-0 place-items-center rounded-full bg-brand-500 text-sm font-semibold text-navy-950"
                >
                  {index + 1}
                </span>
                <div className="pt-1">
                  <h3 className="font-semibold text-ink-900">{step.title}</h3>
                  <p className="mt-1.5 text-sm/6 text-ink-600">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>

          <Link to="/login" className={buttonClasses({ size: "lg", className: "mt-10" })}>
            Start in the portal
            <ArrowRight className="size-4" />
          </Link>
        </div>

        <aside className="rounded-2xl border border-ink-200/70 bg-white p-8 shadow-sm shadow-ink-950/[0.03]">
          <h3 className="text-lg font-semibold text-ink-900">Key dates</h3>
          <p className="mt-1 text-sm text-ink-500">2026/2027 first semester</p>

          <dl className="mt-6 divide-y divide-ink-200/70">
            {dates.map((date) => (
              <div key={date.label} className="flex items-baseline justify-between gap-4 py-4">
                <dt className="text-sm text-ink-600">{date.label}</dt>
                <dd className="text-sm font-semibold text-ink-900">{date.value}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-6 rounded-xl bg-navy-950 p-5">
            <p className="text-sm/6 text-navy-200">
              Questions about an application? The registry answers on weekdays,
              8:00 to 16:00.
            </p>
            <a
              href="mailto:registry@nyenneh.edu"
              className="mt-3 inline-block text-sm font-semibold text-brand-400 transition hover:text-brand-300"
            >
              registry@nyenneh.edu
            </a>
          </div>
        </aside>
      </div>
    </Section>
  );
}
