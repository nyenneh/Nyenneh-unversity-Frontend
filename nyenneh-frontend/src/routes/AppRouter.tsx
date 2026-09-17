import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { ProtectedRoute } from "@/components/shared/ProtectedRoute";
import { ScrollToHash } from "@/components/shared/ScrollToHash";
import { LoadingState } from "@/components/ui/States";
import AdminLayout from "@/layouts/AdminLayout";
import LecturerLayout from "@/layouts/LecturerLayout";
import PublicLayout from "@/layouts/PublicLayout";
import StudentLayout from "@/layouts/StudentLayout";
import { homePathForRole } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";

// landing page stays in the main chunk - it is what most people hit first, so
// splitting it would just add a round trip before anything paints
import LandingPage from "@/pages/public/LandingPage";

// the rest of the public site is split out. someone who only reads the landing
// page never downloads the FAQ bank or the enquiry forms.
const LeadershipPage = lazy(() => import("@/pages/public/LeadershipPage"));
const QuestionsPage = lazy(() => import("@/pages/public/QuestionsPage"));
const ContactPage = lazy(() => import("@/pages/public/ContactPage"));

// auth screens drag in react-hook-form and zod, which the landing page doesn't need
const LoginPage = lazy(() => import("@/pages/auth/LoginPage"));
const ChangePasswordPage = lazy(() => import("@/pages/auth/ChangePasswordPage"));
const ForbiddenPage = lazy(() => import("@/pages/ForbiddenPage"));
const NotFoundPage = lazy(() => import("@/pages/NotFoundPage"));

// one chunk per dashboard, so a student never downloads the admin screens
const AdminDashboardPage = lazy(() => import("@/pages/admin/AdminDashboardPage"));
const DepartmentsPage = lazy(() => import("@/pages/admin/DepartmentsPage"));
const CoursesPage = lazy(() => import("@/pages/admin/CoursesPage"));
const ClassSlotsPage = lazy(() => import("@/pages/admin/ClassSlotsPage"));
const StudentsPage = lazy(() => import("@/pages/admin/StudentsPage"));
const LecturersPage = lazy(() => import("@/pages/admin/LecturersPage"));
const RegistrationsPage = lazy(() => import("@/pages/admin/RegistrationsPage"));
const AdminGradesPage = lazy(() => import("@/pages/admin/GradesPage"));
const FinancePage = lazy(() => import("@/pages/admin/FinancePage"));
const AllocationsPage = lazy(() => import("@/pages/admin/AllocationsPage"));

const LecturerDashboardPage = lazy(() => import("@/pages/lecturer/LecturerDashboardPage"));
const MyCoursesPage = lazy(() => import("@/pages/lecturer/MyCoursesPage"));
const AttendancePage = lazy(() => import("@/pages/lecturer/AttendancePage"));
const QuizzesPage = lazy(() => import("@/pages/lecturer/QuizzesPage"));
const MarkSheetPage = lazy(() => import("@/pages/lecturer/MarkSheetPage"));

const StudentDashboardPage = lazy(() => import("@/pages/student/StudentDashboardPage"));
const CourseRegistrationPage = lazy(() => import("@/pages/student/CourseRegistrationPage"));
const SchedulePage = lazy(() => import("@/pages/student/SchedulePage"));
const ResultsPage = lazy(() => import("@/pages/student/ResultsPage"));
const FeesPage = lazy(() => import("@/pages/student/FeesPage"));

// sends /portal to whichever dashboard fits the role
function HomeRedirect() {
  const user = useAuthStore((state) => state.user);
  const hydrated = useAuthStore((state) => state.hydrated);

  if (!hydrated) return <LoadingState />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.must_change_password) return <Navigate to="/change-password" replace />;
  return <Navigate to={homePathForRole(user.role)} replace />;
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      {/* puts back the scroll-to-anchor behaviour we lose with client routing */}
      <ScrollToHash />

      <Suspense
        fallback={
          <div className="grid min-h-[60vh] place-items-center">
            <LoadingState />
          </div>
        }
      >
        <Routes>
          {/* public site. the portal is behind /portal. */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/leadership" element={<LeadershipPage />} />
            <Route path="/questions" element={<QuestionsPage />} />
            <Route path="/contact" element={<ContactPage />} />
          </Route>

          <Route path="/portal" element={<HomeRedirect />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/change-password" element={<ChangePasswordPage />} />
          <Route path="/forbidden" element={<ForbiddenPage />} />

          {/* Admin area */}
          <Route element={<ProtectedRoute allow={["admin"]} />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboardPage />} />
              <Route path="departments" element={<DepartmentsPage />} />
              <Route path="courses" element={<CoursesPage />} />
              <Route path="slots" element={<ClassSlotsPage />} />
              <Route path="students" element={<StudentsPage />} />
              <Route path="lecturers" element={<LecturersPage />} />
              <Route path="registrations" element={<RegistrationsPage />} />
              <Route path="grades" element={<AdminGradesPage />} />
              <Route path="finance" element={<FinancePage />} />
              <Route path="allocations" element={<AllocationsPage />} />
            </Route>
          </Route>

          {/* Lecturer area */}
          <Route element={<ProtectedRoute allow={["lecturer"]} />}>
            <Route path="/lecturer" element={<LecturerLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<LecturerDashboardPage />} />
              <Route path="courses" element={<MyCoursesPage />} />
              <Route path="attendance" element={<AttendancePage />} />
              <Route path="quizzes" element={<QuizzesPage />} />
              <Route path="marks" element={<MarkSheetPage />} />
            </Route>
          </Route>

          {/* Student area */}
          <Route element={<ProtectedRoute allow={["student"]} />}>
            <Route path="/student" element={<StudentLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<StudentDashboardPage />} />
              <Route path="courses" element={<CourseRegistrationPage />} />
              <Route path="schedule" element={<SchedulePage />} />
              <Route path="grades" element={<ResultsPage />} />
              <Route path="fees" element={<FeesPage />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
