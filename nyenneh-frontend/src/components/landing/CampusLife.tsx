import { ArrowRight, Building2, Quote, Users, Wifi } from "lucide-react";
import { Link } from "react-router-dom";

import { Section, SectionHeading } from "@/components/landing/Section";
import { buttonClasses } from "@/components/ui/buttonStyles";

const highlights = [
  {
    icon: Building2,
    title: "Labs that stay open",
    body: "Computing and engineering laboratories run until 22:00 on weekdays, with technicians on hand.",
  },
  {
    icon: Users,
    title: "Small teaching groups",
    body: "Courses cap at sixty and tutorials at twenty, so lecturers know who is in the room.",
  },
  {
    icon: Wifi,
    title: "Connected campus",
    body: "Campus-wide wifi and a portal that works on the phone in your pocket, not just in the lab.",
  },
];

export function CampusLife() {
  return (
    <>
      <Section id="campus" className="bg-white" aria-labelledby="campus-heading">
        <SectionHeading
          id="campus-heading"
          eyebrow="Campus life"
          title="A campus that runs on time"
          align="center"
          description="Nyenneh is a working campus in Sinkor — close enough to Monrovia to find an internship, far enough to actually study."
        />

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {highlights.map((item) => (
            <div key={item.title} className="rounded-2xl bg-ink-50 p-6">
              <span className="grid size-11 place-items-center rounded-xl bg-white text-navy-900 shadow-sm">
                <item.icon className="size-5" />
              </span>
              <h3 className="mt-5 font-semibold text-ink-900">{item.title}</h3>
              <p className="mt-2 text-sm/6 text-ink-600">{item.body}</p>
            </div>
          ))}
        </div>

        <figure className="mt-14 rounded-2xl border border-ink-200/70 bg-white p-8 shadow-sm shadow-ink-950/[0.03] sm:p-10">
          <Quote aria-hidden className="size-8 text-brand-400" />
          <blockquote className="mt-5 text-xl/8 font-medium text-ink-800 sm:text-2xl/9">
            I registered for five courses on my phone during the holidays and my
            timetable was waiting for me when I got back to campus. My first year
            here, that took three days and two queues.
          </blockquote>
          <figcaption className="mt-6 text-sm text-ink-500">
            <span className="font-semibold text-ink-900">Amina Sesay</span> · Computer
            Science, Level 300
          </figcaption>
        </figure>
      </Section>

      {/* Closing call to action — gold band, navy type. */}
      <div className="bg-brand-500">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-semibold tracking-tight text-navy-950 sm:text-4xl">
                Your semester starts in the portal
              </h2>
              <p className="mt-3 text-base/7 text-navy-900/80">
                Sign in with the credentials the registry issued you to register for
                courses, check results and settle your fees.
              </p>
            </div>

            <Link
              to="/login"
              className={buttonClasses({
                size: "lg",
                className: "shrink-0 bg-navy-950 text-white hover:bg-navy-900",
              })}
            >
              Sign in to the portal
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
