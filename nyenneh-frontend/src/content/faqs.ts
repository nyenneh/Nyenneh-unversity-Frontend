// The questions students actually turn up with: how to apply, how to register,
// and who to ask when the answer isn't here.
//
// Keep the answers matching what the portal really does - registration is a
// request the registry approves, results only appear once published, an unpaid
// balance can block a registration. The site and the product shouldn't disagree.

export const faqCategories = [
  "Admissions",
  "Registration",
  "Fees and payments",
  "Results and transcripts",
  "Portal help",
  "Campus life",
] as const;

export type FaqCategory = (typeof faqCategories)[number];

export interface Faq {
  id: string;
  category: FaqCategory;
  question: string;
  answer: string[]; // one entry per paragraph
  office?: string; // matched against `offices` in content/contact
}

export const faqs: Faq[] = [
  /* --- admissions --- */
  {
    id: "how-to-apply",
    category: "Admissions",
    question: "How do I apply for admission?",
    answer: [
      "Press “How to apply” anywhere on this site, fill in your name, phone number and the programme you want, and the form opens WhatsApp with your enquiry typed out. Press send and the admissions office picks it up from there.",
      "You will be asked for your senior secondary results, a valid photo ID and a passport photograph. Applications are reviewed on a rolling basis rather than all at once after the deadline.",
    ],
    office: "admissions",
  },
  {
    id: "entry-requirements",
    category: "Admissions",
    question: "What are the entry requirements?",
    answer: [
      "A senior secondary certificate with passes in five subjects, English and Mathematics among them. Engineering and Computer Science additionally require a pass in Physics.",
      "Applicants who sat an examination outside Liberia should send the certificate and the awarding body's grading scale so the registry can map it.",
    ],
    office: "admissions",
  },
  {
    id: "application-deadline",
    category: "Admissions",
    question: "When do applications close?",
    answer: [
      "Applications for the 2026/2027 first semester close on 31 October. Registration opens on 10 November and the semester begins on 24 November.",
      "Late applications are considered where a programme still has seats, but they are not guaranteed a place.",
    ],
    office: "admissions",
  },
  {
    id: "transfer-student",
    category: "Admissions",
    question: "Can I transfer from another university?",
    answer: [
      "Yes. Send your transcript and course descriptions to the admissions office; the faculty decides which courses carry over and at what level you enter.",
      "Transfer decisions are made by the faculty rather than the registry, so allow two to three weeks in term time.",
    ],
    office: "admissions",
  },
  {
    id: "admission-outcome",
    category: "Admissions",
    question: "How will I know whether I have been admitted?",
    answer: [
      "Admitted applicants receive an email carrying a roll number and a temporary portal password. That email is your admission letter.",
      "If you have heard nothing three weeks after applying, write to the admissions office quoting the phone number you applied with.",
    ],
    office: "admissions",
  },

  /* --- registration --- */
  {
    id: "how-to-register",
    category: "Registration",
    question: "How do I register for courses?",
    answer: [
      "Sign in to the portal, open Course Registration, and pick from the courses open to your level and semester. Your selections are submitted as one load, and the registry approves each course before it reaches your schedule.",
      "Register early. Courses have a seat limit, and the portal shows how many are left as you go.",
    ],
    office: "registry",
  },
  {
    id: "registration-window",
    category: "Registration",
    question: "When can I register?",
    answer: [
      "Registration opens two weeks before the semester begins and closes at the end of the second teaching week. The portal shows the window as open or closed on the registration screen.",
      "Nothing can be registered once the window closes — a late registration needs the registrar's written approval.",
    ],
    office: "registry",
  },
  {
    id: "pending-registration",
    category: "Registration",
    question: "My registration says “pending”. What does that mean?",
    answer: [
      "It has reached the registry and is waiting on a decision. Pending is normal; approvals are usually issued within two working days during the registration window.",
      "A rejected course comes back with a reason attached — most often a clash, a missing prerequisite or an outstanding balance. Fix that and submit the course again.",
    ],
    office: "registry",
  },
  {
    id: "blocked-by-fees",
    category: "Registration",
    question: "Why can't I register — it mentions outstanding fees?",
    answer: [
      "An unsettled balance from a previous semester blocks a new registration. Open Tuition & Fees in the portal to see exactly what is outstanding.",
      "Once the bursary confirms your payment the block lifts by itself; you do not need to ask for it to be cleared.",
    ],
    office: "bursary",
  },
  {
    id: "drop-a-course",
    category: "Registration",
    question: "Can I drop a course after registering?",
    answer: [
      "Yes, up to the end of the third teaching week. Open Course Registration in the portal and drop it from your selections.",
      "After that week the course stays on your record, and an absence from the examination is scored as a failure.",
    ],
    office: "registry",
  },
  {
    id: "carryover",
    category: "Registration",
    question: "What is a carryover, and how do I register one?",
    answer: [
      "A carryover is a course you failed and must repeat. It appears in the portal alongside the courses for your current level and is flagged as a carryover on your registration.",
      "Carryovers count against your semester load, so register them before adding electives.",
    ],
    office: "registry",
  },
  {
    id: "credit-load",
    category: "Registration",
    question: "How many credit units should I register?",
    answer: [
      "Your programme's regulations set a minimum and a maximum load for each semester. The portal adds up the units as you select courses, so you can see where you stand.",
      "A load outside those limits is rejected at approval, so check the total before you submit.",
    ],
    office: "registry",
  },

  /* --- fees --- */
  {
    id: "how-much-is-tuition",
    category: "Fees and payments",
    question: "How much is tuition?",
    answer: [
      "Tuition depends on your programme and level, and the bursary publishes the fee structure for each session before registration opens.",
      "Once you are admitted, the exact figure for your semester appears as an invoice under Tuition & Fees in the portal.",
    ],
    office: "bursary",
  },
  {
    id: "how-to-pay",
    category: "Fees and payments",
    question: "How do I pay my fees?",
    answer: [
      "By bank transfer, card, mobile money or cash at the bursary. Quote the invoice reference shown in the portal on every payment — it is how the bursary matches money to a student.",
      "Payments made at the bank are confirmed by the bursary rather than automatically, so keep the deposit slip until the portal shows the payment as confirmed.",
    ],
    office: "bursary",
  },
  {
    id: "payment-not-showing",
    category: "Fees and payments",
    question: "I paid, but the portal still shows a balance.",
    answer: [
      "A payment sits as pending until the bursary confirms it against the bank statement, usually within one working day.",
      "If it is still pending after two working days, send the bursary the invoice reference and a photograph of the deposit slip.",
    ],
    office: "bursary",
  },
  {
    id: "instalments",
    category: "Fees and payments",
    question: "Can I pay in instalments?",
    answer: [
      "Yes. The bursary allows the semester's tuition in two instalments, and registration is released once the first instalment clears.",
      "The second instalment is due before the examination timetable is published; results are withheld on an unsettled account.",
    ],
    office: "bursary",
  },
  {
    id: "receipt",
    category: "Fees and payments",
    question: "Where do I get a receipt?",
    answer: [
      "Every confirmed payment appears under Tuition & Fees in the portal with its date, method and reference, and can be printed from there.",
      "For a stamped receipt on letterhead, ask at the bursary in person.",
    ],
    office: "bursary",
  },

  /* --- results --- */
  {
    id: "when-are-results-published",
    category: "Results and transcripts",
    question: "When do results appear in the portal?",
    answer: [
      "A result becomes visible the moment the faculty publishes it, which is normally two to three weeks after the last examination of the semester.",
      "Until then My Results shows nothing for that course. An unpublished mark is not a missing mark.",
    ],
    office: "registry",
  },
  {
    id: "how-grades-are-calculated",
    category: "Results and transcripts",
    question: "How is my grade worked out?",
    answer: [
      "Each course carries continuous assessment — the quizzes, tests and coursework your lecturer sets — plus a final examination. The two add up to the total score, which maps to a letter grade and a grade point.",
      "Your semester GPA weights each grade point by the course's credit units; the CGPA does the same across every semester you have completed. Both are shown on My Results.",
    ],
    office: "registry",
  },
  {
    id: "disputed-mark",
    category: "Results and transcripts",
    question: "I think a mark is wrong. What do I do?",
    answer: [
      "Speak to the lecturer who taught the course first — most corrections are settled there. If it is not resolved, apply to the registry for a remark within two weeks of publication.",
      "A remark covers the examination script only; continuous assessment is not re-marked.",
    ],
    office: "registry",
  },
  {
    id: "transcript",
    category: "Results and transcripts",
    question: "How do I request a transcript?",
    answer: [
      "Apply at the registry with your roll number and a settled account. Transcripts are issued within five working days and can be sent directly to another institution on request.",
      "The results screen in the portal is a statement for your own use, not a transcript — it is neither signed nor sealed.",
    ],
    office: "registry",
  },

  /* --- portal --- */
  {
    id: "first-sign-in",
    category: "Portal help",
    question: "How do I sign in for the first time?",
    answer: [
      "Use the email address you applied with and the temporary password from your admission email. The portal asks you to set your own password before it lets you go any further.",
      "Staff accounts work the same way: the registry issues a temporary password that has to be changed on first sign-in.",
    ],
    office: "helpdesk",
  },
  {
    id: "forgot-password",
    category: "Portal help",
    question: "I have forgotten my password.",
    answer: [
      "Write to the IT helpdesk from the email address on your student record, quoting your roll number. They issue a fresh temporary password by email.",
      "For your own safety, passwords are never reset over the phone or on WhatsApp.",
    ],
    office: "helpdesk",
  },
  {
    id: "session-expired",
    category: "Portal help",
    question: "The portal signed me out on its own.",
    answer: [
      "Sessions expire after a period of inactivity, and signing in again restores everything — nothing you had already submitted is lost.",
      "If it happens repeatedly within minutes, tell the helpdesk which screen you were on.",
    ],
    office: "helpdesk",
  },
  {
    id: "portal-on-phone",
    category: "Portal help",
    question: "Can I use the portal on my phone?",
    answer: [
      "Yes. Every screen — registration, schedule, results and fees — is built to work in a phone browser, and there is nothing to install.",
      "Campus wifi is free for registered students, so registering does not have to cost you data.",
    ],
    office: "helpdesk",
  },

  /* --- campus --- */
  {
    id: "accommodation",
    category: "Campus life",
    question: "Is accommodation available?",
    answer: [
      "The university has a limited number of hall places, allocated by Student Affairs and weighted towards first-year students and those travelling from outside Montserrado.",
      "Apply to Student Affairs as soon as you are admitted; places are gone well before the semester begins.",
    ],
    office: "student-affairs",
  },
  {
    id: "student-council",
    category: "Campus life",
    question: "Who represents students to the university?",
    answer: [
      "The Students' Representative Council, elected each year. Its president sits on the University Council, so student business reaches the governing body directly.",
      "Class representatives handle course-level matters with lecturers and with the faculty.",
    ],
    office: "student-affairs",
  },
];

// the two most people are here for, pinned above the full list
export const featuredFaqIds = ["how-to-apply", "how-to-register"];

// registration start to finish, for someone already admitted. rendered by both
// the landing section and the questions page.
export const registrationSteps = [
  {
    title: "Settle your account",
    body: "Open Tuition & Fees in the portal and clear the balance, or pay the first instalment at the bursary. An outstanding balance blocks a new registration.",
  },
  {
    title: "Sign in to the portal",
    body: "Use your email address and your password. First-time students use the temporary password from the admission email, then choose their own.",
  },
  {
    title: "Pick your courses",
    body: "Course Registration lists everything open to your level and semester, carryovers included, with the seats remaining on each. The portal totals your credit units as you go.",
  },
  {
    title: "Submit the load",
    body: "Send the whole semester's selection at once. Each course reaches the registry as a request and shows as pending until it is decided.",
  },
  {
    title: "Check back for approval",
    body: "Approved courses appear on My Schedule with their class times and venues. A rejected course comes back with the reason, so you can fix it and submit again.",
  },
];
