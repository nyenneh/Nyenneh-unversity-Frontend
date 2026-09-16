import {
  BookOpen,
  ClipboardCheck,
  FileQuestion,
  GraduationCap,
  LayoutDashboard,
} from "lucide-react";

import { PortalLayout, type NavItem } from "./PortalLayout";

const navItems: NavItem[] = [
  { label: "Dashboard", to: "/lecturer/dashboard", icon: LayoutDashboard },
  { label: "My Courses", to: "/lecturer/courses", icon: BookOpen },
  { label: "Attendance", to: "/lecturer/attendance", icon: ClipboardCheck },
  { label: "Quizzes", to: "/lecturer/quizzes", icon: FileQuestion },
  { label: "Mark Sheet", to: "/lecturer/marks", icon: GraduationCap },
];

export default function LecturerLayout() {
  return <PortalLayout subtitle="Lecturer Portal" navItems={navItems} />;
}
