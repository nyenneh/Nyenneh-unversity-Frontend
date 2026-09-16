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

// The public front door stays in the entry chunk: it is what most visitors
// land on, so splitting it would only add a round trip before first paint.
import LandingPage from "@/pages/public/LandingPage";

// The rest of the public site is split off — a visitor who only reads the
// landing page never downloads the answer bank or the enquiry forms.
const LeadershipPage = lazy(() => import("@/pages/public/LeadershipPage"));
const QuestionsPage = lazy(() => import("@/pages/public/QuestionsPage"));
const ContactPage = lazy(() => import("@/pages/public/ContactPage"));

// Everything else is a separate chunk. The auth screens carry react-hook-form
// and zod, which nothing on the landing page needs.
const LoginPage = lazy(() => import("@/pages/auth/LoginPage"));
const ChangePasswordPage = lazy(() => import("@/pages/auth/ChangePasswordPage"));
const ForbiddenPage = lazy(() => import("@/pages/ForbiddenPage"));
const NotFoundPage = lazy(() => import("@/pages/NotFoundPage"));

// Each dashboard is a separate chunk, so signing in as a student never pays to
// download the admin screens.
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

/** Sends "/portal" to whichever dashboard suits the signed-in role. */
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
      {/* Restores the scroll-to-anchor the browser does on a plain page load. */}
      <ScrollToHash />

      <Suspense
        fallback={
          <div className="grid min-h-[60vh] place-items-center">
            <LoadingState />
          </div>
        }
      >
        <Routes>
          {/* Public site; the portal lives behind /portal. */}
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
