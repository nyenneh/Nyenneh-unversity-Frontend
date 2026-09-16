import { BookOpen, CalendarDays, GraduationCap, Wallet } from "lucide-react";

import { Section, SectionHeading } from "@/components/landing/Section";
import { Reveal } from "@/components/shared/Reveal";
import { useReveal } from "@/hooks/useReveal";
import { cn } from "@/lib/utils";

/** One entry per screen in the student area of the portal. */
const features = [
  {
    icon: BookOpen,
    title: "Course registration",
    body: "Browse the courses open to your level and semester, watch the remaining capacity update as you go, and submit your load for approval.",
  },
  {
    icon: CalendarDays,
    title: "Class schedule",
    body: "Your approved courses become a weekly timetable with room numbers and lecturers — no clashes, because the portal will not let you register into one.",
  },
  {
    icon: GraduationCap,
    title: "Results and CGPA",
    body: "Grades appear the moment the faculty publishes them, with grade points, semester GPA and a running cumulative average.",
  },
  {
    icon: Wallet,
    title: "Tuition and fees",
    body: "See what is invoiced, what is paid and what is outstanding, and download a receipt for every payment the bursary records.",
  },
];

/** One portal screen, easing in as the pair is scrolled to. */
function FeatureCard({ feature, delay }: { feature: (typeof features)[number]; delay: number }) {
  const {
    ref: revealRef,
    className: revealClass,
    style: revealStyle,
  } = useReveal<HTMLDivElement>({ delay });

  return (
    <div
      ref={revealRef}
      style={revealStyle}
      className={cn(
        "rounded-2xl border border-white/10 bg-white/5 p-6 transition hover:border-brand-400/40 hover:bg-white/[0.07]",
        revealClass,
      )}
    >
      <span className="grid size-11 place-items-center rounded-xl bg-brand-500 text-navy-950">
        <feature.icon className="size-5" />
      </span>
      <h3 className="mt-5 text-lg font-semibold text-white">{feature.title}</h3>
      <p className="mt-2 text-sm/6 text-navy-200">{feature.body}</p>
    </div>
  );
}

export function PortalPreview() {
  return (
    <Section id="portal" className="bg-navy-950" aria-labelledby="portal-heading">
      <Reveal>
        <SectionHeading
          id="portal-heading"
          tone="dark"
          eyebrow="The student portal"
          title="Everything the registry used to do at a counter"
          description="One sign-in covers the whole degree — registering, attending, being graded and paying. Staff work in the same system, so what you see is the record, not a copy of it."
        />
      </Reveal>

      <div className="mt-12 grid gap-6 sm:grid-cols-2">
        {features.map((feature, index) => (
          <FeatureCard key={feature.title} feature={feature} delay={index * 90} />
        ))}
      </div>
    </Section>
  );
}
