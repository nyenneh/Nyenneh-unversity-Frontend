import { DepartmentSlideshow } from "@/components/landing/DepartmentSlideshow";
import { Section, SectionHeading } from "@/components/landing/Section";
import { Reveal } from "@/components/shared/Reveal";
import { departments, facultyCount } from "@/content/departments";

// TODO: swap these for the registry's published numbers.
// the faculty and department counts are derived so at least those can't drift
// away from the slideshow below
const stats = [
  { value: String(facultyCount), label: "Faculties" },
  { value: String(departments.length), label: "Departments" },
  { value: "1,800+", label: "Students enrolled" },
  { value: "92%", label: "Graduate on time" },
];

export function Academics() {
  return (
    <>
      {/* navy type on gold, same as everywhere else */}
      <div className="bg-brand-500">
        <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
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

      {/* the widest thing on the page - the stats band and the slideshow are
          one block, and the slideshow needs the room */}
      <Section
        id="academics"
        width="wide"
        className="py-24 sm:py-32"
        aria-labelledby="academics-heading"
      >
        <Reveal>
          <SectionHeading
            id="academics-heading"
            eyebrow="Academics"
            title="Six departments, one credit system"
            description="Every programme runs on semester credit units, so a course you pass counts the same wherever you take it. Registration caps, prerequisites and results are all handled in the portal."
          />
        </Reveal>

        <Reveal className="mt-14">
          <DepartmentSlideshow />
        </Reveal>
      </Section>
    </>
  );
}
