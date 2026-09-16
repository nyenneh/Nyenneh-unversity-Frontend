import { DepartmentSlideshow } from "@/components/landing/DepartmentSlideshow";
import { Section, SectionHeading } from "@/components/landing/Section";
import { Reveal } from "@/components/shared/Reveal";
import { departments, facultyCount } from "@/content/departments";

// Placeholder institutional figures — swap for the registry's published numbers.
// The faculty and department counts are derived so they cannot drift from the
// slideshow below them.
const stats = [
  { value: String(facultyCount), label: "Faculties" },
  { value: String(departments.length), label: "Departments" },
  { value: "1,800+", label: "Students enrolled" },
  { value: "92%", label: "Graduate on time" },
];

export function Academics() {
  return (
    <>
      {/* Stats sit on gold, so the type is navy — the house rule for gold fills. */}
      <div className="bg-brand-500">
        <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <dl className="grid grid-cols-2 gap-8 lg:grid-cols-4">
            {stats.map((stat, index) => (
              <Reveal key={stat.label} delay={index * 70}>
                <dt className="text-sm font-medium text-navy-900/70">{stat.label}</dt>
                <dd className="mt-1 text-3xl font-semibold tracking-tight text-navy-950 sm:text-4xl">
                  {stat.value}
                </dd>
              </Reveal>
            ))}
          </dl>
        </div>
      </div>

      <Section id="academics" aria-labelledby="academics-heading">
        <Reveal>
          <SectionHeading
            id="academics-heading"
            eyebrow="Academics"
            title="Six departments, one credit system"
            description="Every programme runs on semester credit units, so a course you pass counts the same wherever you take it. Registration caps, prerequisites and results are all handled in the portal."
          />
        </Reveal>

        <Reveal className="mt-12">
          <DepartmentSlideshow />
        </Reveal>
      </Section>
    </>
  );
}
