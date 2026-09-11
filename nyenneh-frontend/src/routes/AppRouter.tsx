import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { ProtectedRoute } from "@/components/shared/ProtectedRoute";
import { LoadingState } from "@/components/ui/States";
import AdminLayout from "@/layouts/AdminLayout";
import StudentLayout from "@/layouts/StudentLayout";
import { homePathForRole } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";

// The public front door stays in the entry chunk: it is what most visitors
// land on, so splitting it would only add a round trip before first paint.
import LandingPage from "@/pages/public/LandingPage";

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
const RegistrationsPage = lazy(() => import("@/pages/admin/RegistrationsPage"));
const AdminGradesPage = lazy(() => import("@/pages/admin/GradesPage"));
const FinancePage = lazy(() => import("@/pages/admin/FinancePage"));

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
      <Suspense
        fallback={
          <div className="grid min-h-[60vh] place-items-center">
            <LoadingState />
          </div>
        }
      >
        <Routes>
          {/* Public front door; the portal lives behind /portal. */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/portal" element={<HomeRedirect />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/change-password" element={<ChangePasswordPage />} />
          <Route path="/forbidden" element={<ForbiddenPage />} />

          {/* Admin area */}
          <Route element={<ProtectedRoute allow={["admin", "lecturer"]} />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboardPage />} />
              <Route path="departments" element={<DepartmentsPage />} />
              <Route path="courses" element={<CoursesPage />} />
              <Route path="slots" element={<ClassSlotsPage />} />
              <Route path="students" element={<StudentsPage />} />
              <Route path="registrations" element={<RegistrationsPage />} />
              <Route path="grades" element={<AdminGradesPage />} />
              <Route path="finance" element={<FinancePage />} />
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
