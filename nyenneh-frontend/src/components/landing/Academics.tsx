import { Briefcase, Cpu, Zap } from "lucide-react";

import { Section, SectionHeading } from "@/components/landing/Section";

// Placeholder institutional figures — swap for the registry's published numbers.
const stats = [
  { value: "3", label: "Faculties" },
  { value: "24", label: "Degree programmes" },
  { value: "1,800+", label: "Students enrolled" },
  { value: "92%", label: "Graduate within 4 years" },
];

/** Mirrors the departments the portal actually manages. */
const faculties = [
  {
    icon: Cpu,
    code: "CSC",
    name: "Computer Science",
    faculty: "Faculty of Science",
    head: "Prof. A. Bawa",
    blurb:
      "Algorithms, databases, operating systems and web application development, taught on the machines students will actually work on.",
    courses: ["Data Structures and Algorithms", "Database Management Systems", "Operating Systems"],
  },
  {
    icon: Briefcase,
    code: "BAM",
    name: "Business Administration",
    faculty: "Management Sciences",
    head: "Dr. L. Mensah",
    blurb:
      "Management, accounting and enterprise, grounded in the way West African businesses are built and run.",
    courses: ["Principles of Management", "Financial Accounting", "Entrepreneurship"],
  },
  {
    icon: Zap,
    code: "EEE",
    name: "Electrical Engineering",
    faculty: "Faculty of Engineering",
    head: "Dr. S. Kollie",
    blurb:
      "Circuits, power systems and control, with laboratory work from the first semester rather than the final year.",
    courses: ["Circuit Theory II", "Power Systems", "Control Engineering"],
  },
];

export function Academics() {
  return (
    <>
      {/* Stats sit on gold, so the type is navy — the house rule for gold fills. */}
      <div className="bg-brand-500">
        <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <dl className="grid grid-cols-2 gap-8 lg:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label}>
                <dt className="text-sm font-medium text-navy-900/70">{stat.label}</dt>
                <dd className="mt-1 text-3xl font-semibold tracking-tight text-navy-950 sm:text-4xl">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <Section id="academics" aria-labelledby="academics-heading">
        <SectionHeading
          id="academics-heading"
          eyebrow="Academics"
          title="Three faculties, one credit system"
          description="Every programme runs on semester credit units, so a course you pass counts the same wherever you take it. Registration caps, prerequisites and results are all handled in the portal."
        />

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {faculties.map((item) => (
            <article
              key={item.code}
              className="group flex flex-col rounded-2xl border border-ink-200/70 bg-white p-6 shadow-sm shadow-ink-950/[0.03] transition hover:border-brand-300 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <span className="grid size-11 place-items-center rounded-xl bg-navy-950 text-brand-400 transition group-hover:bg-navy-900">
                  <item.icon className="size-5" />
                </span>
                <span className="rounded-md bg-ink-100 px-2 py-1 text-xs font-semibold tracking-wide text-ink-600">
                  {item.code}
                </span>
              </div>

              <h3 className="mt-5 text-lg font-semibold text-ink-900">{item.name}</h3>
              <p className="text-sm text-ink-500">{item.faculty}</p>
              <p className="mt-3 text-sm/6 text-ink-600">{item.blurb}</p>

              <ul className="mt-5 space-y-2 border-t border-ink-200/70 pt-5 text-sm text-ink-600">
                {item.courses.map((course) => (
                  <li key={course} className="flex gap-2">
                    <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-brand-500" />
                    {course}
                  </li>
                ))}
              </ul>

              <p className="mt-5 text-xs text-ink-500">
                Head of department · <span className="text-ink-700">{item.head}</span>
              </p>
            </article>
          ))}
        </div>
      </Section>
    </>
  );
}
