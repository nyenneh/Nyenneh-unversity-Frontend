import {
  Briefcase,
  Cpu,
  HardHat,
  MicVocal,
  Stethoscope,
  Zap,
  type LucideIcon,
} from "lucide-react";

/**
 * The six departments the university admits into, as the public site presents
 * them.
 *
 * Placeholder heads and intake figures — swap for the registry's published
 * list. The codes are the ones the portal uses on course registrations, so
 * they have to match what the backend returns for a programme.
 */

export interface Department {
  /** Slug, and the key the slideshow tracks slides by. */
  id: string;
  /** Registration code, e.g. "CSC 401". Shown on the slide as a chip. */
  code: string;
  name: string;
  /** The faculty the department sits under. */
  faculty: string;
  /** Head of department — the post, not the academic title. */
  head: string;
  /** The degree awarded, shown under the name. */
  award: string;
  /** Full-time years to graduation. */
  duration: string;
  /** One paragraph: what the department actually teaches, not a mission statement. */
  blurb: string;
  /** Three representative courses. Kept to three so every slide is the same height. */
  courses: string[];
  icon: LucideIcon;
}

export const departments: Department[] = [
  {
    id: "computer-science",
    code: "CSC",
    name: "Computer Science",
    faculty: "Faculty of Science",
    head: "Prof. Augustine N. Bawa",
    award: "BSc (Hons)",
    duration: "4 years",
    blurb:
      "Algorithms, databases, operating systems and web application development, taught on the machines students will actually work on. Final-year projects ship to real users.",
    courses: [
      "Data Structures and Algorithms",
      "Database Management Systems",
      "Operating Systems",
    ],
    icon: Cpu,
  },
  {
    id: "business-administration",
    code: "BAM",
    name: "Business Administration",
    faculty: "Management Sciences",
    head: "Dr. Lydia A. Mensah",
    award: "BSc (Hons)",
    duration: "4 years",
    blurb:
      "Management, accounting and enterprise, grounded in the way West African businesses are built and run. Every final-year student graduates with a placement behind them.",
    courses: ["Principles of Management", "Financial Accounting", "Entrepreneurship"],
    icon: Briefcase,
  },
  {
    id: "mass-communication",
    code: "MCM",
    name: "Mass Communication",
    faculty: "Arts and Communication",
    head: "Mr. Varney T. Johnson",
    award: "BA (Hons)",
    duration: "4 years",
    blurb:
      "Reporting, broadcast production and media law, taught out of a working newsroom and radio studio rather than a lecture theatre. Students file copy from their first semester.",
    courses: ["News Writing and Reporting", "Broadcast Production", "Media Law and Ethics"],
    icon: MicVocal,
  },
  {
    id: "civil-engineering",
    code: "CVE",
    name: "Civil Engineering",
    faculty: "Faculty of Engineering",
    head: "Engr. Morris K. Gaye",
    award: "BEng (Hons)",
    duration: "5 years",
    blurb:
      "Structures, materials and water resources, with survey camp and site attachment built into the programme. Designed against the loads and soils this coast actually presents.",
    courses: ["Structural Analysis", "Soil Mechanics", "Surveying and Geomatics"],
    icon: HardHat,
  },
  {
    id: "electrical-engineering",
    code: "EEE",
    name: "Electrical Engineering",
    faculty: "Faculty of Engineering",
    head: "Dr. Saye T. Kollie",
    award: "BEng (Hons)",
    duration: "5 years",
    blurb:
      "Circuits, power systems and control, with laboratory work from the first semester rather than the final year. The engineering labs stay open until 22:00.",
    courses: ["Circuit Theory II", "Power Systems", "Control Engineering"],
    icon: Zap,
  },
  {
    id: "nursing",
    code: "NUR",
    name: "Nursing",
    faculty: "Health Sciences",
    head: "Mrs. Bendu S. Wesseh",
    award: "BSc (Hons)",
    duration: "4 years",
    blurb:
      "Anatomy, pharmacology and clinical practice, with supervised rotations on the wards of partner hospitals from the second year. Accredited by the Board of Nursing.",
    courses: ["Anatomy and Physiology", "Pharmacology", "Medical-Surgical Nursing"],
    icon: Stethoscope,
  },
];

/** Distinct faculties across the departments above, for the stats band. */
export const facultyCount = new Set(departments.map((d) => d.faculty)).size;
