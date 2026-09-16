/**
 * The people who run the university, as the public site presents them.
 *
 * Placeholder officers — swap for the registry's published list. The landing
 * section shows the principal officers only; the leadership page shows
 * everything in this file.
 */

export interface Leader {
  id: string;
  name: string;
  /** The post, not the academic title: "Vice-Chancellor", not "Professor". */
  role: string;
  /** The office or faculty the post carries. */
  unit: string;
  /** Year of appointment, shown as "In post since 2019". */
  since: string;
  bio: string;
  /** Written to directly from the leadership page. */
  email: string;
  /** What this office decides — the reason a visitor would write to them. */
  responsibilities: string[];
}

/** The senior management team. Order matters: it is the order of precedence. */
export const principalOfficers: Leader[] = [
  {
    id: "vice-chancellor",
    name: "Prof. Josephine T. Wreh",
    role: "Vice-Chancellor",
    unit: "Office of the Vice-Chancellor",
    since: "2019",
    bio: "An economist by training, she came to Nyenneh from twenty years in higher-education administration across West Africa, and has spent her tenure moving the university's records off paper and into one system students can reach from a phone.",
    email: "vc@nyenneh.edu",
    responsibilities: [
      "Overall academic and administrative leadership",
      "Reports to the University Council",
      "Confers degrees at congregation",
    ],
  },
  {
    id: "dvc-academic",
    name: "Prof. Emmanuel K. Doe",
    role: "Deputy Vice-Chancellor, Academic Affairs",
    unit: "Academic Affairs",
    since: "2021",
    bio: "A mathematician who has taught at Nyenneh since its founding faculty was three rooms and a generator. He chairs the Senate committee that approves every new programme and every change to the grading regulations.",
    email: "dvc.academic@nyenneh.edu",
    responsibilities: [
      "Curriculum, programmes and academic standards",
      "Examinations and the publication of results",
      "Academic staff appointments and promotion",
    ],
  },
  {
    id: "dvc-admin",
    name: "Mr. Alphonso G. Tarr",
    role: "Deputy Vice-Chancellor, Administration and Finance",
    unit: "Administration and Finance",
    since: "2020",
    bio: "A chartered accountant who ran the finance function of a national utility before joining the university. He is responsible for the fee structure that appears on every student invoice.",
    email: "dvc.admin@nyenneh.edu",
    responsibilities: [
      "Budget, fees and financial control",
      "Estates, facilities and campus services",
      "Non-academic staff and procurement",
    ],
  },
  {
    id: "registrar",
    name: "Mrs. Fatu B. Kamara",
    role: "Registrar",
    unit: "Registry",
    since: "2018",
    bio: "The custodian of the university's academic record. Every roll number issued, every course registration approved and every transcript signed since 2018 has passed through her office.",
    email: "registrar@nyenneh.edu",
    responsibilities: [
      "Admissions, registration and student records",
      "Transcripts, certificates and verification",
      "Secretary to Senate and to the University Council",
    ],
  },
  {
    id: "bursar",
    name: "Mr. Samuel P. Gbollie",
    role: "Bursar",
    unit: "Bursary",
    since: "2022",
    bio: "Runs the bursary and the payment desk. He introduced the instalment arrangement that lets a student register once the first instalment clears rather than the full semester's tuition.",
    email: "bursar@nyenneh.edu",
    responsibilities: [
      "Invoicing, collections and receipts",
      "Payment confirmation and refunds",
      "Scholarship and bursary disbursement",
    ],
  },
  {
    id: "dean-of-students",
    name: "Dr. Mariama S. Konneh",
    role: "Dean of Students",
    unit: "Student Affairs",
    since: "2023",
    bio: "A counselling psychologist who oversees welfare, accommodation and the student representative council, and who sits on every disciplinary panel the university convenes.",
    email: "deanofstudents@nyenneh.edu",
    responsibilities: [
      "Student welfare, counselling and accommodation",
      "Clubs, societies and the students' council",
      "Student conduct and discipline",
    ],
  },
];

/** One dean per faculty. Departmental heads sit under them. */
export const deans: Leader[] = [
  {
    id: "dean-science",
    name: "Prof. Augustine N. Bawa",
    role: "Dean, Faculty of Science",
    unit: "Faculty of Science",
    since: "2021",
    bio: "Heads the faculty that houses Computer Science, and still teaches the second-year algorithms course he wrote the syllabus for.",
    email: "dean.science@nyenneh.edu",
    responsibilities: [
      "Computer Science, Mathematics and the laboratory sciences",
      "Faculty examination board",
      "Research supervision and postgraduate admissions",
    ],
  },
  {
    id: "dean-management",
    name: "Dr. Lydia A. Mensah",
    role: "Dean, Management Sciences",
    unit: "Management Sciences",
    since: "2022",
    bio: "Built the faculty's internship programme with firms across Monrovia, so that final-year business students graduate with a placement already behind them.",
    email: "dean.management@nyenneh.edu",
    responsibilities: [
      "Business Administration, Accounting and Economics",
      "Industry placements and the internship programme",
      "Professional certification partnerships",
    ],
  },
  {
    id: "dean-engineering",
    name: "Dr. Saye T. Kollie",
    role: "Dean, Faculty of Engineering",
    unit: "Faculty of Engineering",
    since: "2020",
    bio: "A power-systems engineer who insists on laboratory work from the first semester rather than the final year, and who keeps the engineering labs open until 22:00.",
    email: "dean.engineering@nyenneh.edu",
    responsibilities: [
      "Electrical, Civil and Mechanical Engineering",
      "Laboratories, workshops and technical staff",
      "Accreditation and professional body liaison",
    ],
  },
];

/** The governing body. Names only — council members hold no executive office. */
export const council = [
  { name: "Hon. Rebecca M. Sirleaf", role: "Chair of the University Council" },
  { name: "Prof. Josephine T. Wreh", role: "Vice-Chancellor (ex officio)" },
  { name: "Mr. Daniel K. Nyenneh", role: "Representative of the Founders" },
  { name: "Dr. Comfort Y. Toe", role: "Ministry of Education nominee" },
  { name: "Mr. Isaac B. Cooper", role: "Alumni Association nominee" },
  { name: "Ms. Grace W. Flomo", role: "President, Students' Representative Council" },
  { name: "Mrs. Fatu B. Kamara", role: "Registrar and Secretary to Council" },
];
