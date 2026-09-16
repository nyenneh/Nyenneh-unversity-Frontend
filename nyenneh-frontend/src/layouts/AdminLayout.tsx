import {
  Building2,
  BookOpen,
  CalendarDays,
  ClipboardCheck,
  GraduationCap,
  LayoutDashboard,
  UserCheck,
  UserPlus,
  Users,
  Wallet,
} from "lucide-react";

import { PortalLayout, type NavItem } from "./PortalLayout";

const navItems: NavItem[] = [
  { label: "Dashboard", to: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Departments", to: "/admin/departments", icon: Building2 },
  { label: "Course Catalog", to: "/admin/courses", icon: BookOpen },
  { label: "Class Slots", to: "/admin/slots", icon: CalendarDays },
  { label: "Student Roster", to: "/admin/students", icon: Users },
  { label: "Lecturers", to: "/admin/lecturers", icon: UserPlus },
  { label: "Registrations", to: "/admin/registrations", icon: ClipboardCheck },
  { label: "Allocations", to: "/admin/allocations", icon: UserCheck },
  { label: "Grade Control", to: "/admin/grades", icon: GraduationCap },
  { label: "Finance", to: "/admin/finance", icon: Wallet },
];

export default function AdminLayout() {
  return <PortalLayout subtitle="Admin Control Center" navItems={navItems} />;
}
