# Nyenneh University Student Portal (frontend)

React + TypeScript + Vite front end for the Nyenneh University student portal.
Talks to a Django REST Framework backend.

## Getting started

```bash
npm install
npm run dev      # http://localhost:5173
```

Mock mode is on by default (`VITE_USE_MOCK_API=true` in `.env.development`), so
it runs end to end with no backend at all. Either demo account works, and the
login screen has one-click buttons for both:

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@nyenneh.edu` | `admin123` |
| Student | `student@nyenneh.edu` | `student123` |

Set `VITE_USE_MOCK_API=false` to point at the real Django server. In dev the
requests go to `/api` and Vite proxies them to `http://127.0.0.1:8000` (see
`vite.config.ts`), so there is no CORS setup to worry about. For production put
the deployed API URL in `VITE_API_BASE_URL` in `.env.production`.

### Scripts

| Command | Does |
| --- | --- |
| `npm run dev` | dev server with HMR |
| `npm run build` | typecheck (`tsc -b`) then bundle |
| `npm run lint` | ESLint over the project |
| `npm run preview` | serve the production build locally |

## How it is laid out

```
src/
  services/       axios client, one module per API area, plus the old mock adapter
  hooks/          React Query hooks - the only thing pages are allowed to call
  store/          zustand auth store (persisted)
  components/ui/  Button, Input, Modal, Table, Toast, loading/error/empty states
  components/shared/  PageHeader, StatCard, StatusBadge, ProtectedRoute
  components/landing/ the public site
  layouts/        PortalLayout shell, configured by AdminLayout / StudentLayout
  pages/          one folder per area: public, auth, admin, lecturer, student
  routes/         route tree, role guards, lazy-loaded pages
  types/          the domain model everything shares
```

Things worth knowing before you change anything:

- Pages never touch axios. A page calls a hook, the hook calls a service, the
  service calls the client. Changing an endpoint means editing
  `services/endpoints.ts` and nothing else.
- Every write goes through `useMutationWithToast`, so all of them get the same
  success toast, the same DRF error handling and the same cache invalidation.
- JWT refresh is automatic. A 401 fires one refresh call (concurrent 401s share
  it) and the original request is retried. If the refresh fails the session is
  cleared and you end up back on `/login`.
- `services/mock/` is no longer wired up. It was an axios adapter rather than a
  second code path, so the same services and hooks ran in both modes, but it was
  written against an early API contract the backend never implemented. It is
  excluded from typechecking and kept only for reference.

## The API

Field names are snake_case to match the DRF serializers. Paths are relative to
`VITE_API_BASE_URL`, they all live in `src/services/endpoints.ts`, and the full
response shapes are in `src/types/index.ts`.

### Auth

| Method | Path | Notes |
| --- | --- | --- |
| POST | `auth/login/` | `{email, password}` -> `{access, refresh, user}` |
| POST | `auth/refresh/` | `{refresh}` -> `{access}` |
| GET | `auth/me/` | current `User` |
| POST | `auth/change-password/` | `{current_password, new_password}` |

`user.role` is `student`, `lecturer` or `admin`, and decides which half of the
portal the account can get into.

### Academics

| Method | Path | Notes |
| --- | --- | --- |
| GET/POST | `academic/departments/` | |
| PATCH/DELETE | `academic/departments/{id}/` | |
| GET/POST | `academic/courses/` | filters: `search`, `department`, `level`, `semester` |
| PATCH/DELETE | `academic/courses/{id}/` | |
| GET/POST | `academic/class-slots/` | filters: `course`, `student` |
| PATCH/DELETE | `academic/class-slots/{id}/` | |
| GET | `academic/class-slots/my-schedule/` | signed-in student's timetable |
| GET/POST | `enrollments/` | POST takes `{course}`, student comes from the token |
| DELETE | `enrollments/{id}/` | student drops a course |
| POST | `enrollments/{id}/approve/` | should also create the gradebook row |
| POST | `enrollments/{id}/reject/` | |

### Students, grades, finance

| Method | Path | Notes |
| --- | --- | --- |
| GET/POST | `students/` | filters: `search`, `department`, `level`, `status` |
| GET/PATCH/DELETE | `students/{id}/` | |
| GET | `grades/results/` | filters: `course`, `student`, `session`, `semester` |
| PATCH | `grades/results/{id}/` | `{ca_score, exam_score}`, server works out the rest |
| POST | `grades/results/publish/` | `{results: []}` -> `{updated: n}` |
| GET | `grades/semester-results/my-results/` | published rows only, with GPA/CGPA |
| GET/POST | `finance/invoices/` | filters: `search`, `status` |
| POST | `finance/invoices/generate/` | bills a session's fee structure to a cohort |
| GET/POST | `finance/payments/` | filter: `invoice`; unfiltered is scoped by token |
| POST | `finance/invoices/pay/` | `{amount, method}` -> `PaymentResult` |
| GET | `dashboard/admin/` | `AdminDashboardStats` |
| GET | `dashboard/student/` | `StudentDashboardStats` |
| GET | `dashboard/lecturer/` | `LecturerDashboardStats` |

List endpoints can come back either as a plain array or as a DRF pagination
envelope (`{count, next, previous, results}`). `unwrapList` in `services/api.ts`
handles both, so nothing upstream has to care which one it got.

## Rules the backend owns

The UI is built assuming these hold, but the server is the one that has to
actually enforce them:

- CA is marked out of 40 and the exam out of 60. `total_score`, `letter_grade`
  and `grade_point` are all derived server-side (A >= 70, B >= 60, C >= 50,
  D >= 45, E >= 40, otherwise F).
- Students cannot see results until `is_published` is true.
- A course cannot be registered past its `capacity`, and not twice by the same
  student.
- A venue cannot host two classes that overlap on the same day.
- A payment cannot be bigger than the invoice balance. Invoice `status` and
  `balance` are recomputed from `amount` and `amount_paid`.
- `finance/invoices/pay/` takes a lump sum and spreads it over the student's
  outstanding invoices, oldest due date first, rejecting anything larger than
  the total owed. That allocation lives on the server so the UI never has to
  decide which charge a payment clears.
