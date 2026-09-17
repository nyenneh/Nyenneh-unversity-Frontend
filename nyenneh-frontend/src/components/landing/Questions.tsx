import { ArrowRight, HelpCircle } from "lucide-react";
import { Link } from "react-router-dom";

import { FaqAccordion } from "@/components/landing/FaqAccordion";
import { Section, SectionHeading } from "@/components/landing/Section";
import { Reveal } from "@/components/shared/Reveal";
import { faqs, registrationSteps } from "@/content/faqs";
import { useReveal } from "@/hooks/useReveal";
import { cn } from "@/lib/utils";

// The ones the registry answers on the phone over and over: how do I register,
// when does it open, why is mine still pending, why am I blocked. Full set is
// on /questions, this is just the short version.
const topQuestionIds = [
  "how-to-register",
  "registration-window",
  "pending-registration",
  "blocked-by-fees",
  "first-sign-in",
  "when-are-results-published",
];

const topQuestions = topQuestionIds
  .map((id) => faqs.find((faq) => faq.id === id))
  .filter((faq) => faq !== undefined);

function Step({ step, index }: { step: (typeof registrationSteps)[number]; index: number }) {
  const {
    ref: revealRef,
    className: revealClass,
    style: revealStyle,
  } = useReveal<HTMLLIElement>({ delay: index * 80 });

  return (
    <li ref={revealRef} style={revealStyle} className={cn("flex gap-4", revealClass)}>
      <span
        aria-hidden
        className="grid size-8 shrink-0 place-items-center rounded-full bg-brand-500 text-xs font-semibold text-navy-950"
      >
        {index + 1}
      </span>
      <div className="pt-0.5">
        <h4 className="text-sm font-semibold text-ink-900">{step.title}</h4>
        <p className="mt-1 text-sm/6 text-ink-600">{step.body}</p>
      </div>
    </li>
  );
}

export function Questions() {
  return (
    <Section id="questions" className="bg-white py-16 sm:py-20" aria-labelledby="questions-heading">
      <Reveal>
        <SectionHeading
          id="questions-heading"
          eyebrow="Questions"
          title="How to register, and where to ask"
          description="Registration happens in the portal, in five steps, from wherever you are. Everything below is the answer the registry would give you at the counter."
        />
      </Reveal>

      <div className="mt-10 grid gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16">
        {/* registering for a semester, start to finish */}
        <div>
          <h3 className="text-lg font-semibold text-ink-900">
            Registering for a semester
          </h3>

          <ol className="mt-6 space-y-6">
            {registrationSteps.map((step, index) => (
              <Step key={step.title} step={step} index={index} />
            ))}
          </ol>
        </div>

        {/* what those five steps still leave people asking */}
        <div>
          <h3 className="text-lg font-semibold text-ink-900">Asked most often</h3>

          <Reveal>
            <FaqAccordion items={topQuestions} className="mt-6" />
          </Reveal>

          <Reveal className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
            <Link
              to="/questions"
              className="inline-flex items-center gap-2 text-sm font-semibold text-brand-700 transition hover:text-brand-600"
            >
              <HelpCircle className="size-4" />
              All {faqs.length} questions, and a form to ask your own
              <ArrowRight className="size-4" />
            </Link>
          </Reveal>
        </div>
      </div>
    </Section>
  );
}
