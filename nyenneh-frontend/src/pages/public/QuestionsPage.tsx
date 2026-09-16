import { Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { EnquiryForm } from "@/components/landing/EnquiryForm";
import { FaqAccordion } from "@/components/landing/FaqAccordion";
import { PageHero } from "@/components/landing/PageHero";
import { Section, SectionHeading } from "@/components/landing/Section";
import { Reveal } from "@/components/shared/Reveal";
import { campus, enquiryTopics } from "@/content/contact";
import { faqCategories, faqs, registrationSteps } from "@/content/faqs";
import type { FaqCategory } from "@/content/faqs";
import { useReveal } from "@/hooks/useReveal";
import { cn } from "@/lib/utils";

type Filter = FaqCategory | "All";

const filters: Filter[] = ["All", ...faqCategories];

/** Search covers the answers too — people type the problem, not the question. */
function matches(haystack: string[], needle: string) {
  const query = needle.trim().toLowerCase();
  if (!query) return true;
  // Every word has to appear somewhere, so "register fees" narrows rather than widens.
  const words = query.split(/\s+/);
  const text = haystack.join(" ").toLowerCase();
  return words.every((word) => text.includes(word));
}

/** One numbered step in the registration walkthrough. */
function StepCard({ step, index }: { step: (typeof registrationSteps)[number]; index: number }) {
  const { ref, className, style } = useReveal<HTMLLIElement>({ delay: index * 80 });

  return (
    <li
      ref={ref}
      style={style}
      className={cn(
        "rounded-2xl border border-ink-200/70 bg-white p-6 shadow-sm shadow-ink-950/[0.03]",
        className,
      )}
    >
      <span
        aria-hidden
        className="grid size-9 place-items-center rounded-full bg-brand-500 text-sm font-semibold text-navy-950"
      >
        {index + 1}
      </span>
      <h3 className="mt-4 font-semibold text-ink-900">{step.title}</h3>
      <p className="mt-2 text-sm/6 text-ink-600">{step.body}</p>
    </li>
  );
}

export default function QuestionsPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Filter>("All");

  const results = useMemo(
    () =>
      faqs.filter(
        (faq) =>
          (category === "All" || faq.category === category) &&
          matches([faq.question, ...faq.answer, faq.category], query),
      ),
    [query, category],
  );

  const searching = query.trim() !== "";

  return (
    <>
      <PageHero
        eyebrow="Questions"
        title="How to register, and everything else you asked"
        description="Admission, registration, fees, results and the portal itself — answered the way the registry would answer them at the counter. If yours is not here, the form at the bottom reaches the right office."
      >
        <dl className="mt-10 grid max-w-2xl grid-cols-2 gap-6 sm:grid-cols-4">
          {[
            { value: String(faqs.length), label: "Answers" },
            { value: String(faqCategories.length), label: "Topics" },
            { value: "5", label: "Steps to register" },
            { value: "1 day", label: "Typical reply" },
          ].map((stat) => (
            <div key={stat.label}>
              <dt className="sr-only">{stat.label}</dt>
              <dd>
                <span className="block text-2xl font-semibold text-brand-400">
                  {stat.value}
                </span>
                <span className="mt-1 block text-sm text-navy-200">{stat.label}</span>
              </dd>
            </div>
          ))}
        </dl>
      </PageHero>

      {/* Registration, start to finish — the question this page exists for. */}
      <Section id="how-to-register-steps" aria-labelledby="register-heading">
        <Reveal>
          <SectionHeading
            id="register-heading"
            eyebrow="Step by step"
            title="Registering for a semester"
            description="Once you have been admitted, everything happens in the portal. You can do the whole thing from a phone."
          />
        </Reveal>

        <ol className="mt-12 grid gap-6 md:grid-cols-3 xl:grid-cols-5">
          {registrationSteps.map((step, index) => (
            <StepCard key={step.title} step={step} index={index} />
          ))}
        </ol>

        <Reveal>
          <p className="mt-8 text-sm/6 text-ink-500">
            Not admitted yet?{" "}
            <Link
              to="/#admissions"
              className="font-semibold text-brand-700 transition hover:text-brand-600"
            >
              Start with admissions
            </Link>{" "}
            — applying comes first, and the portal account comes with the offer.
          </p>
        </Reveal>
      </Section>

      {/* The searchable answer bank. */}
      <Section id="answers" className="bg-ink-50" aria-labelledby="answers-heading">
        <Reveal>
          <SectionHeading
            id="answers-heading"
            eyebrow="Answers"
            title="Search the questions"
            description="Type what went wrong rather than guessing the wording — the search reads the answers as well as the questions."
          />
        </Reveal>

        <Reveal className="mt-10">
          <div className="relative max-w-xl">
            <Search
              aria-hidden
              className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-400"
            />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="fees, pending, password, transcript…"
              aria-label="Search the questions"
              className={cn(
                "w-full rounded-xl border border-ink-200 bg-white py-3 pl-10 pr-10 text-sm text-ink-900",
                "placeholder:text-ink-400 transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100",
              )}
            />
            {searching ? (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear the search"
                className="absolute right-3 top-1/2 grid size-6 -translate-y-1/2 place-items-center rounded-md text-ink-400 transition hover:bg-ink-100 hover:text-ink-700"
              >
                <X className="size-4" />
              </button>
            ) : null}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {filters.map((filter) => {
              const active = filter === category;
              return (
                <button
                  key={filter}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setCategory(filter)}
                  className={cn(
                    "rounded-full border px-3.5 py-1.5 text-sm font-medium transition",
                    active
                      ? "border-navy-950 bg-navy-950 text-white"
                      : "border-ink-200 bg-white text-ink-600 hover:border-ink-300 hover:text-ink-900",
                  )}
                >
                  {filter}
                </button>
              );
            })}
          </div>

          <p className="mt-6 text-sm text-ink-500" aria-live="polite">
            {results.length === 0
              ? "No answer matches that."
              : `${results.length} ${results.length === 1 ? "answer" : "answers"}${
                  category === "All" ? "" : ` in ${category}`
                }`}
          </p>

          {results.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-dashed border-ink-300 bg-white p-8 text-center">
              <p className="text-sm/6 text-ink-600">
                Nothing here covers that yet. Ask it below and the right office will
                answer — and the answer usually ends up on this page.
              </p>
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setCategory("All");
                }}
                className="mt-4 text-sm font-semibold text-brand-700 transition hover:text-brand-600"
              >
                Show every question again
              </button>
            </div>
          ) : (
            <FaqAccordion
              items={results}
              // Category headings only earn their place in a mixed list.
              showCategory={category === "All"}
              className="mt-4"
            />
          )}
        </Reveal>
      </Section>

      {/* Nothing matched, or it needs a person. */}
      <Section id="ask" aria-labelledby="ask-heading">
        <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          <div>
            <Reveal>
              <SectionHeading
                id="ask-heading"
                eyebrow="Ask"
                title="Still no answer?"
                description="Send the question. Enquiries are answered on working days, and anything about your own record needs your roll number."
              />
            </Reveal>

            <Reveal delay={90} className="mt-8 rounded-2xl bg-navy-950 p-6 text-sm/6 text-navy-200">
              <p>
                <span className="font-semibold text-white">Before you write:</span>{" "}
                passwords are never reset over WhatsApp, and nobody at the university
                will ask you for your password. Sign-in problems go to the IT
                helpdesk from your own email address.
              </p>
              <p className="mt-4">
                Offices are open {campus.openingHours.toLowerCase()}.{" "}
                {campus.closedNote}
              </p>
              <Link
                to="/contact"
                className="mt-5 inline-block font-semibold text-brand-400 transition hover:text-brand-300"
              >
                See every office and its direct line
              </Link>
            </Reveal>
          </div>

          <Reveal delay={120}>
            <EnquiryForm
              email={campus.generalEmail}
              topics={enquiryTopics}
              subject="Question from the Nyenneh University website"
              askRollNumber
            />
          </Reveal>
        </div>
      </Section>
    </>
  );
}
