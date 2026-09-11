# Nyenneh University — Student Portal (Frontend)

React + TypeScript + Vite front end for the Nyenneh University student portal, built
against a Django REST Framework backend.

## Getting started

```bash
npm install
npm run dev      # http://localhost:5173
```

The app ships with **mock mode on** (`VITE_USE_MOCK_API=true` in `.env.development`),
so it runs end to end with no backend. Sign in with either demo account — the login
screen has one-click buttons for both:

| Role    | Email                  | Password     |
| ------- | ---------------------- | ------------ |
| Admin   | `admin@nyenneh.edu`    | `admin123`   |
| Student | `student@nyenneh.edu`  | `student123` |

Set `VITE_USE_MOCK_API=false` to talk to the real Django server. In development,
requests go to `/api` and Vite proxies them to `http://127.0.0.1:8000` (see
`vite.config.ts`), so there is no CORS setup to do. For production, point
`VITE_API_BASE_URL` in `.env.production` at the deployed API.

### Scripts

| Command           | What it does                          |
| ----------------- | ------------------------------------- |
| `npm run dev`     | Dev server with HMR                   |
| `npm run build`   | Typecheck (`tsc -b`) and bundle       |
| `npm run lint`    | ESLint over the whole project         |
| `npm run preview` | Serve the production build locally    |

## How it is put together

```
src/
  services/       axios client, one module per API domain, and the mock adapter
  hooks/          React Query hooks — the only thing pages call
  store/          Zustand auth store (persisted)
  components/ui/  Button, Input, Modal, Table, Toast, loading/error/empty states
  components/shared/  PageHeader, StatCard, StatusBadge, ProtectedRoute
  layouts/        PortalLayout shell, configured by AdminLayout / StudentLayout
  pages/          One folder per area: auth, admin, student
  routes/         Route tree with role guards and lazy-loaded pages
  types/          Domain model shared by everything
```

A few decisions worth knowing:

- **Pages never touch axios.** They call a hook, which calls a service, which calls
  the client. Swapping an endpoint means editing `services/endpoints.ts` only.
- **Writes go through `useMutationWithToast`**, so every create/update/delete gets
  the same success toast, DRF error translation and cache invalidation.
- **JWT refresh is automatic.** A 401 triggers one refresh call (concurrent 401s
  share it) and the original request is retried. If refresh fails, the session is
  cleared and the user lands back on `/login`.
- **Mock mode is an axios adapter**, not a parallel code path — the same services,
  hooks and pages run in both modes. Delete `services/mock/` and flip the flag when
  the backend is ready.

## The API contract

Field names are snake_case to match DRF serializers directly. Paths are relative to
`VITE_API_BASE_URL`; every one of them lives in `src/services/endpoints.ts`, and the
full response shapes are in `src/types/index.ts`.

### Auth

| Method | Path                     | Notes                                                |
| ------ | ------------------------ | ---------------------------------------------------- |
| POST   | `auth/login/`            | `{email, password}` → `{access, refresh, user}`      |
| POST   | `auth/refresh/`          | `{refresh}` → `{access}`                             |
| GET    | `auth/me/`               | Current `User`                                       |
| POST   | `auth/change-password/`  | `{current_password, new_password}`                   |

`user.role` is one of `student`, `admin`, `superadmin` and decides which half of the
portal the account can reach.

### Academics

| Method            | Path                            | Notes                                            |
| ----------------- | ------------------------------- | ------------------------------------------------ |
| GET/POST          | `departments/`                  |                                                  |
| PATCH/DELETE      | `departments/{id}/`             |                                                  |
| GET/POST          | `courses/`                      | Filters: `search`, `department`, `level`, `semester` |
| PATCH/DELETE      | `courses/{id}/`                 |                                                  |
| GET/POST          | `class-slots/`                  | Filters: `course`, `student`                     |
| PATCH/DELETE      | `class-slots/{id}/`             |                                                  |
| GET/POST          | `enrollments/`                  | POST takes `{course}`; student comes from the token |
| DELETE            | `enrollments/{id}/`             | Student drops a course                           |
| POST              | `enrollments/{id}/approve/`     | Should also create the gradebook row             |
| POST              | `enrollments/{id}/reject/`      |                                                  |

### Students, grades, finance

| Method            | Path                        | Notes                                              |
| ----------------- | --------------------------- | -------------------------------------------------- |
| GET/POST          | `students/`                 | Filters: `search`, `department`, `level`, `status`  |
| GET/PATCH/DELETE  | `students/{id}/`            |                                                     |
| GET               | `grades/`                   | Filters: `course`, `student`, `session`, `semester`  |
| PATCH             | `grades/{id}/`              | `{ca_score, exam_score}` — server computes the rest  |
| POST              | `grades/publish/`           | `{ids: []}` → `{updated: n}`                        |
| GET               | `grades/my-results/`        | `ResultSummary[]`, published rows only              |
| GET/POST          | `finance/invoices/`         | Filters: `search`, `status`                         |
| GET               | `finance/my-invoices/`      | Scoped to the signed-in student                     |
| GET/POST          | `finance/payments/`         | Filter: `invoice`; unfiltered is scoped by token     |
| POST              | `finance/pay/`              | `{amount, method}` → `PaymentResult`; server allocates |
| GET               | `dashboard/admin/`          | `AdminDashboardStats`                               |
| GET               | `dashboard/student/`        | `StudentDashboardStats`                             |

List endpoints may return a plain array or a DRF pagination envelope
(`{count, next, previous, results}`) — `unwrapList` in `services/api.ts` accepts both.

### Rules the backend owns

The mock implements these so the UI can be built against them; the real API is the
one that must enforce them:

- CA is scored out of 30, the exam out of 70; `total_score`, `letter_grade` and
  `grade_point` are derived server-side (A ≥ 70, B ≥ 60, C ≥ 50, D ≥ 45, E ≥ 40, else F).
- Results stay invisible to students until `is_published` is true.
- A course cannot be registered past its `capacity`, and not twice by one student.
- A venue cannot host two classes that overlap on the same day.
- A payment cannot exceed the invoice balance; invoice `status` and `balance` are
  recomputed from `amount` and `amount_paid`.
- `finance/pay/` takes a lump sum from a student and allocates it across their
  outstanding invoices, oldest due date first, rejecting an amount larger than the
  total owed. Allocation lives on the server so the UI never decides which charge
  a payment clears.
