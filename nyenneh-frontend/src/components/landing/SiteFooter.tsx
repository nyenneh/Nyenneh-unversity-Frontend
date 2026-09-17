import { Mail, MapPin, Phone } from "lucide-react";
import { Link } from "react-router-dom";

import { Logo } from "@/components/shared/Logo";
import { campus } from "@/content/contact";

// Router links all through here, because the footer points at real pages as
// well as sections of the landing page - "/#campus" has to work from /contact
// and not just from "/".
const columns = [
  {
    heading: "Academics",
    links: [
      { label: "Faculty of Science", to: "/#academics" },
      { label: "Management Sciences", to: "/#academics" },
      { label: "Faculty of Engineering", to: "/#academics" },
      { label: "Deans and faculties", to: "/leadership" },
    ],
  },
  {
    heading: "Students",
    links: [
      { label: "How to register", to: "/questions#how-to-register-steps" },
      { label: "What the portal does", to: "/#portal" },
      { label: "Results and transcripts", to: "/questions#answers" },
      { label: "Tuition and fees", to: "/questions#answers" },
    ],
  },
  {
    heading: "About",
    links: [
      { label: "The university", to: "/#about" },
      { label: "Admissions", to: "/#admissions" },
      { label: "Leadership", to: "/leadership" },
      { label: "Campus life", to: "/#campus" },
      { label: "Questions", to: "/questions" },
      { label: "Contact us", to: "/contact" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="bg-navy-950 text-navy-200">
      <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.5fr_2fr]">
          <div>
            <Link to="/" className="flex items-center gap-3 text-white">
              <Logo className="size-9" />
              <span className="text-base font-semibold tracking-tight">
                Nyenneh University
              </span>
            </Link>

            <p className="mt-4 max-w-sm text-sm/6">
              A university built around one idea: the paperwork should never be the
              hard part of your degree.
            </p>

            <ul className="mt-6 space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 size-4 shrink-0 text-brand-400" />
                <span>
                  {campus.line1}, {campus.line2}
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="mt-0.5 size-4 shrink-0 text-brand-400" />
                <a
                  className="transition hover:text-white"
                  href={`mailto:${campus.generalEmail}`}
                >
                  {campus.generalEmail}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="mt-0.5 size-4 shrink-0 text-brand-400" />
                <a
                  className="transition hover:text-white"
                  href={`tel:${campus.switchboardDial}`}
                >
                  {campus.switchboard}
                </a>
              </li>
            </ul>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            {columns.map((column) => (
              <div key={column.heading}>
                <h3 className="text-sm font-semibold text-white">{column.heading}</h3>
                <ul className="mt-4 space-y-3 text-sm">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <Link to={link.to} className="transition hover:text-white">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-white/10 pt-8 text-sm text-navy-300 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} Nyenneh University. All rights reserved.</p>
          <Link to="/login" className="font-medium text-brand-300 transition hover:text-brand-200">
            Staff and student sign in
          </Link>
        </div>
      </div>
    </footer>
  );
}
