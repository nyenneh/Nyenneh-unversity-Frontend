import {
  BookMarked,
  CalendarDays,
  GraduationCap,
  LayoutDashboard,
  Wallet,
} from "lucide-react";

import { PortalLayout, type NavItem } from "./PortalLayout";

const navItems: NavItem[] = [
  { label: "My Dashboard", to: "/student/dashboard", icon: LayoutDashboard },
  { label: "Course Registration", to: "/student/courses", icon: BookMarked },
  { label: "My Schedule", to: "/student/schedule", icon: CalendarDays },
  { label: "My Results", to: "/student/grades", icon: GraduationCap },
  { label: "Tuition & Fees", to: "/student/fees", icon: Wallet },
];

export default function StudentLayout() {
  return <PortalLayout subtitle="Student Portal" navItems={navItems} />;
}
