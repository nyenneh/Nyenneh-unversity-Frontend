import { Banknote, GraduationCap, LifeBuoy, ScrollText, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";

// Who to write to and where the campus is.
// TODO: placeholder details, swap for the university's published contacts.
// The footer, the contact section and the contact page all read from here, so
// one edit changes every address and phone number on the site.
//
// The inbox and the switchboard can also be set per deployment (see
// VITE_CONTACT_EMAIL / VITE_CONTACT_PHONE in the .env files) so changing
// either doesn't need a code change. What's below is just the fallback.

// digits + country code, which is what tel: and wa.me both want
function dialFormat(phone: string) {
  return `+${phone.replace(/\D/g, "")}`;
}

const switchboard = (import.meta.env.VITE_CONTACT_PHONE as string | undefined) || "+231 77 000 0000";

export const campus = {
  line1: "Tubman Boulevard",
  line2: "Sinkor, Monrovia",
  country: "Republic of Liberia",
  mapUrl:
    "https://www.google.com/maps/search/?api=1&query=Tubman+Boulevard%2C+Sinkor%2C+Monrovia",
  switchboard,
  switchboardDial: dialFormat(switchboard), // for tel: links
  generalEmail: (import.meta.env.VITE_CONTACT_EMAIL as string | undefined) || "info@nyenneh.edu",
  openingHours: "Monday to Friday, 08:00 – 16:00",
  closedNote: "Offices close on public holidays and during the mid-semester break.",
} as const;

export interface Office {
  id: string;
  name: string;
  icon: LucideIcon;
  handles: string; // what they can actually settle, so enquiries land in the right inbox
  email: string;
  phone: string;
  phoneDial: string; // derived from phone so they can't drift apart
  hours: string;
}

const officeDetails: Omit<Office, "phoneDial">[] = [
  {
    id: "admissions",
    name: "Admissions Office",
    icon: GraduationCap,
    handles:
      "Applications, entry requirements, transfers from other institutions and admission letters.",
    email: "admissions@nyenneh.edu",
    phone: "+231 77 000 0001",
    hours: "Mon – Fri, 08:00 – 16:00",
  },
  {
    id: "registry",
    name: "Registry",
    icon: ScrollText,
    handles:
      "Course registration and approvals, roll numbers, student records, transcripts and the academic calendar.",
    email: "registry@nyenneh.edu",
    phone: "+231 77 000 0002",
    hours: "Mon – Fri, 08:00 – 16:00",
  },
  {
    id: "bursary",
    name: "Bursary",
    icon: Banknote,
    handles:
      "Tuition invoices, payment confirmation, receipts, instalment arrangements and refunds.",
    email: "bursary@nyenneh.edu",
    phone: "+231 77 000 0003",
    hours: "Mon – Fri, 08:00 – 15:00",
  },
  {
    id: "helpdesk",
    name: "IT Helpdesk",
    icon: LifeBuoy,
    handles:
      "Portal sign-in problems, forgotten or expired passwords, and anything on the portal that will not load.",
    email: "helpdesk@nyenneh.edu",
    phone: "+231 77 000 0004",
    hours: "Mon – Sat, 08:00 – 18:00",
  },
  {
    id: "student-affairs",
    name: "Student Affairs",
    icon: Users,
    handles:
      "Accommodation, student welfare, clubs and societies, and the student representative council.",
    email: "studentaffairs@nyenneh.edu",
    phone: "+231 77 000 0005",
    hours: "Mon – Fri, 09:00 – 17:00",
  },
];

export const offices: Office[] = officeDetails.map((office) => ({
  ...office,
  phoneDial: dialFormat(office.phone),
}));

// enquiry form topics, roughly in the order people need them
export const enquiryTopics = [
  "Admission and entry requirements",
  "How to register for courses",
  "Tuition, fees and payments",
  "Results and transcripts",
  "Portal sign-in and passwords",
  "Accommodation and student life",
  "Something else",
];
