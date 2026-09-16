import { ChevronDown } from "lucide-react";

import { offices } from "@/content/contact";
import type { Faq } from "@/content/faqs";
import { cn } from "@/lib/utils";

/** Answers name the office that settles them; this turns that id into a contact. */
function officeFor(id: string | undefined) {
  return id ? offices.find((office) => office.id === id) : undefined;
}

interface FaqAccordionProps {
  items: Faq[];
  /** Adds the category above each question, for a mixed list such as search results. */
  showCategory?: boolean;
  className?: string;
}

/**
 * Built on <details>/<summary>, so a question opens without JavaScript, the
 * keyboard works for free, and the browser's find-in-page can reach an answer
 * inside a collapsed panel.
 */
export function FaqAccordion({ items, showCategory = false, className }: FaqAccordionProps) {
  return (
    <div className={cn("divide-y divide-ink-200/70 overflow-hidden rounded-2xl border border-ink-200/70 bg-white", className)}>
      {items.map((faq) => {
        const office = officeFor(faq.office);

        return (
          <details key={faq.id} id={faq.id} name="faq" className="group scroll-mt-24">
            <summary
              className={cn(
                "flex cursor-pointer list-none items-start gap-4 px-5 py-4 text-left sm:px-6",
                "transition hover:bg-ink-50 focus-visible:bg-ink-50",
                "[&::-webkit-details-marker]:hidden",
              )}
            >
              <span className="min-w-0 flex-1">
                {showCategory ? (
                  <span className="block text-xs font-semibold uppercase tracking-[0.14em] text-brand-700">
                    {faq.category}
                  </span>
                ) : null}
                <span className="mt-0.5 block font-medium text-ink-900">{faq.question}</span>
              </span>

              <ChevronDown
                aria-hidden
                className="mt-0.5 size-5 shrink-0 text-ink-400 transition group-open:rotate-180"
              />
            </summary>

            <div className="space-y-3 px-5 pb-5 pr-12 sm:px-6 sm:pb-6">
              {faq.answer.map((paragraph) => (
                <p key={paragraph} className="text-sm/6 text-ink-600">
                  {paragraph}
                </p>
              ))}

              {office ? (
                <p className="pt-1 text-sm text-ink-500">
                  Still stuck? {office.name} —{" "}
                  <a
                    href={`mailto:${office.email}`}
                    className="font-medium text-brand-700 transition hover:text-brand-600"
                  >
                    {office.email}
                  </a>
                </p>
              ) : null}
            </div>
          </details>
        );
      })}
    </div>
  );
}
