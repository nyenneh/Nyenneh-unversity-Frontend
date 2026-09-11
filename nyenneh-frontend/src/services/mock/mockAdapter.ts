/*
 * DISCONNECTED — kept for reference only.
 *
 * These fixtures were written against a draft API contract (class slots,
 * announcements, an enrollment approval workflow, course capacity) that the
 * Django backend does not implement. The portal now talks to the real API
 * through `services/adapters.ts`, so nothing imports this file and it is
 * excluded from typechecking in tsconfig.app.json.
 */

import type { AxiosAdapter, AxiosResponse, InternalAxiosRequestConfig } from "axios";

import { endpoints } from "../endpoints";
import * as fixtures from "./fixtures";
import type {
  AdminDashboardStats,
  ClassSlot,
  Course,
  Department,
  Enrollment,
  Grade,
  Invoice,
  Payment,
  PaymentResult,
  ResultSummary,
  Student,
  StudentDashboardStats,
  User,
} from "@/types";

/**
 * An in-memory stand-in for the Django API, enabled with VITE_USE_MOCK_API=true.
 *
 * It is installed as an axios adapter, so every service, hook and page runs the
 * exact same code path it will run against the real backend — only the transport
 * is swapped. Deleting this folder and flipping the flag is the whole migration.
 *
 * Mutations persist for the lifetime of the tab (the arrays below are cloned
 * once at module load), which is enough to demo create/edit/delete flows.
 */

const db = {
  departments: structuredClone(fixtures.departments),
  courses: structuredClone(fixtures.courses),
  slots: structuredClone(fixtures.classSlots),
  students: structuredClone(fixtures.students),
  enrollments: structuredClone(fixtures.enrollments),
  grades: structuredClone(fixtures.grades),
  invoices: structuredClone(fixtures.invoices),
  payments: structuredClone(fixtures.payments),
};

/** The student record standing in for "the logged-in student". */
const CURRENT_STUDENT_ID = 1;

let nextId = 1000;
const makeId = () => ++nextId;

const delay = (ms = 260) => new Promise((resolve) => setTimeout(resolve, ms));

class MockHttpError extends Error {
  status: number;
  payload: unknown;

  constructor(status: number, payload: unknown) {
    super(typeof payload === "string" ? payload : "Mock request failed");
    this.status = status;
    this.payload = payload;
  }
}

const badRequest = (detail: string) => new MockHttpError(400, { detail });

function ok<T>(data: T, config: InternalAxiosRequestConfig, status = 200): AxiosResponse<T> {
  return {
    data,
    status,
    statusText: status === 201 ? "Created" : "OK",
    headers: {},
    config,
  };
}

/** Strips the axios baseURL and any query string, leaving "courses/12/". */
function normalisePath(config: InternalAxiosRequestConfig) {
  const raw = config.url ?? "";
  const withoutBase = raw.replace(/^https?:\/\/[^/]+/, "");
  const path = withoutBase.split("?")[0];
  return path.replace(/^\/?api\/?/, "").replace(/^\/+/, "");
}

function body<T>(config: InternalAxiosRequestConfig): T {
  if (!config.data) return {} as T;
  return typeof config.data === "string" ? JSON.parse(config.data) : (config.data as T);
}

function params(config: InternalAxiosRequestConfig): Record<string, string> {
  const entries = Object.entries((config.params ?? {}) as Record<string, unknown>)
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .map(([key, value]) => [key, String(value)]);
  return Object.fromEntries(entries);
}

const matches = (haystack: string, needle: string) =>
  haystack.toLowerCase().includes(needle.toLowerCase());

/** Copies a fixture user without its password, the way a serializer would. */
function publicUser(record: (typeof fixtures.users)[number]): User {
  return {
    id: record.id,
    email: record.email,
    full_name: record.full_name,
    role: record.role,
    roll_number: record.roll_number ?? null,
    avatar_url: record.avatar_url ?? null,
  };
}

// --- derived values -------------------------------------------------------

const departmentName = (id: number) =>
  db.departments.find((department) => department.id === id)?.name ?? "Unassigned";

function letterFor(total: number): { letter: string; point: number } {
  if (total >= 70) return { letter: "A", point: 5 };
  if (total >= 60) return { letter: "B", point: 4 };
  if (total >= 50) return { letter: "C", point: 3 };
  if (total >= 45) return { letter: "D", point: 2 };
  if (total >= 40) return { letter: "E", point: 1 };
  return { letter: "F", point: 0 };
}

/** Recomputes total/letter/point after a score edit, mirroring the serializer. */
function applyScores(grade: Grade, ca: number | null, exam: number | null): Grade {
  const total = ca !== null && exam !== null ? ca + exam : null;
  const graded = total !== null ? letterFor(total) : null;
  return {
    ...grade,
    ca_score: ca,
    exam_score: exam,
    total_score: total,
    letter_grade: graded?.letter ?? null,
    grade_point: graded?.point ?? null,
  };
}

function invoiceStatus(invoice: Invoice): Invoice {
  const balance = invoice.amount - invoice.amount_paid;
  const overdue = new Date(invoice.due_date) < new Date();
  const status: Invoice["status"] =
    balance <= 0
      ? "paid"
      : invoice.amount_paid > 0
        ? "part_paid"
        : overdue
          ? "overdue"
          : "unpaid";
  return { ...invoice, balance, status };
}

function gpaFor(grades: Grade[]) {
  const graded = grades.filter((grade) => grade.grade_point !== null);
  const units = graded.reduce((sum, grade) => sum + grade.credit_units, 0);
  if (!units) return 0;
  const points = graded.reduce(
    (sum, grade) => sum + (grade.grade_point ?? 0) * grade.credit_units,
    0,
  );
  return Number((points / units).toFixed(2));
}

// --- route table ----------------------------------------------------------

type Handler = (config: InternalAxiosRequestConfig) => unknown;

/** [method, RegExp, handler]. First match wins; captures are passed via exec. */
const routes: [string, RegExp, Handler][] = [
  // Auth ------------------------------------------------------------------
  [
    "post",
    /^auth\/login\/$/,
    (config) => {
      const { email, password } = body<{ email: string; password: string }>(config);
      const match = fixtures.users.find(
        (user) => user.email.toLowerCase() === email?.trim().toLowerCase(),
      );
      if (!match || match.password !== password) {
        throw new MockHttpError(401, {
          detail: "No active account found with the given credentials.",
        });
      }
      const user = publicUser(match);
      return { access: `mock-access-${user.id}`, refresh: `mock-refresh-${user.id}`, user };
    },
  ],
  [
    "post",
    /^auth\/refresh\/$/,
    () => ({ access: `mock-access-refreshed-${Date.now()}` }),
  ],
  [
    "get",
    /^auth\/me\/$/,
    () => publicUser(fixtures.users[1]),
  ],
  ["post", /^auth\/change-password\/$/, () => ({ detail: "Password updated." })],

  // Departments -----------------------------------------------------------
  ["get", /^departments\/$/, () => db.departments],
  [
    "post",
    /^departments\/$/,
    (config) => {
      const input = body<Department>(config);
      const created: Department = {
        ...input,
        id: makeId(),
        course_count: 0,
        student_count: 0,
      };
      db.departments.push(created);
      return created;
    },
  ],
  [
    "patch",
    /^departments\/(\d+)\/$/,
    (config) => {
      const id = Number(/^departments\/(\d+)\//.exec(normalisePath(config))![1]);
      const index = db.departments.findIndex((department) => department.id === id);
      if (index < 0) throw new MockHttpError(404, { detail: "Department not found." });
      db.departments[index] = { ...db.departments[index], ...body<Department>(config) };
      return db.departments[index];
    },
  ],
  [
    "delete",
    /^departments\/(\d+)\/$/,
    (config) => {
      const id = Number(/^departments\/(\d+)\//.exec(normalisePath(config))![1]);
      if (db.courses.some((course) => course.department === id)) {
        throw badRequest("Remove the courses in this department first.");
      }
      db.departments = db.departments.filter((department) => department.id !== id);
      return null;
    },
  ],

  // Courses ---------------------------------------------------------------
  [
    "get",
    /^courses\/$/,
    (config) => {
      const query = params(config);
      return db.courses.filter((course) => {
        if (query.search && !matches(`${course.code} ${course.title}`, query.search)) {
          return false;
        }
        if (query.department && course.department !== Number(query.department)) return false;
        if (query.level && course.level !== Number(query.level)) return false;
        if (query.semester && course.semester !== query.semester) return false;
        return true;
      });
    },
  ],
  [
    "post",
    /^courses\/$/,
    (config) => {
      const input = body<Course>(config);
      if (db.courses.some((course) => course.code === input.code)) {
        throw new MockHttpError(400, { code: ["A course with this code already exists."] });
      }
      const created: Course = {
        ...input,
        id: makeId(),
        department_name: departmentName(input.department),
        enrolled_count: 0,
      };
      db.courses.push(created);
      return created;
    },
  ],
  [
    "patch",
    /^courses\/(\d+)\/$/,
    (config) => {
      const id = Number(/^courses\/(\d+)\//.exec(normalisePath(config))![1]);
      const index = db.courses.findIndex((course) => course.id === id);
      if (index < 0) throw new MockHttpError(404, { detail: "Course not found." });
      const patch = body<Partial<Course>>(config);
      db.courses[index] = {
        ...db.courses[index],
        ...patch,
        department_name: patch.department
          ? departmentName(patch.department)
          : db.courses[index].department_name,
      };
      return db.courses[index];
    },
  ],
  [
    "delete",
    /^courses\/(\d+)\/$/,
    (config) => {
      const id = Number(/^courses\/(\d+)\//.exec(normalisePath(config))![1]);
      db.courses = db.courses.filter((course) => course.id !== id);
      db.slots = db.slots.filter((slot) => slot.course !== id);
      return null;
    },
  ],

  // Class slots -----------------------------------------------------------
  [
    "get",
    /^class-slots\/$/,
    (config) => {
      const query = params(config);
      let slots = db.slots;
      if (query.course) slots = slots.filter((slot) => slot.course === Number(query.course));
      if (query.student) {
        const courseIds = db.enrollments
          .filter(
            (enrollment) =>
              enrollment.student === Number(query.student) && enrollment.status === "approved",
          )
          .map((enrollment) => enrollment.course);
        slots = slots.filter((slot) => courseIds.includes(slot.course));
      }
      return slots;
    },
  ],
  [
    "post",
    /^class-slots\/$/,
    (config) => {
      const input = body<ClassSlot>(config);
      const course = db.courses.find((item) => item.id === input.course);
      if (!course) throw badRequest("Select a valid course.");
      if (input.start_time >= input.end_time) {
        throw badRequest("The end time must come after the start time.");
      }
      const clash = db.slots.find(
        (slot) =>
          slot.day === input.day &&
          slot.venue === input.venue &&
          input.start_time < slot.end_time &&
          slot.start_time < input.end_time,
      );
      if (clash) {
        throw badRequest(`${input.venue} is already booked for ${clash.course_code} then.`);
      }
      const created: ClassSlot = {
        ...input,
        id: makeId(),
        course_code: course.code,
        course_title: course.title,
      };
      db.slots.push(created);
      return created;
    },
  ],
  [
    "patch",
    /^class-slots\/(\d+)\/$/,
    (config) => {
      const id = Number(/^class-slots\/(\d+)\//.exec(normalisePath(config))![1]);
      const index = db.slots.findIndex((slot) => slot.id === id);
      if (index < 0) throw new MockHttpError(404, { detail: "Class slot not found." });
      const patch = body<Partial<ClassSlot>>(config);
      const course = patch.course
        ? db.courses.find((item) => item.id === patch.course)
        : undefined;
      db.slots[index] = {
        ...db.slots[index],
        ...patch,
        course_code: course?.code ?? db.slots[index].course_code,
        course_title: course?.title ?? db.slots[index].course_title,
      };
      return db.slots[index];
    },
  ],
  [
    "delete",
    /^class-slots\/(\d+)\/$/,
    (config) => {
      const id = Number(/^class-slots\/(\d+)\//.exec(normalisePath(config))![1]);
      db.slots = db.slots.filter((slot) => slot.id !== id);
      return null;
    },
  ],

  // Students --------------------------------------------------------------
  [
    "get",
    /^students\/$/,
    (config) => {
      const query = params(config);
      return db.students.filter((student) => {
        if (
          query.search &&
          !matches(`${student.full_name} ${student.roll_number} ${student.email}`, query.search)
        ) {
          return false;
        }
        if (query.department && student.department !== Number(query.department)) return false;
        if (query.level && student.level !== Number(query.level)) return false;
        if (query.status && student.status !== query.status) return false;
        return true;
      });
    },
  ],
  [
    "get",
    /^students\/(\d+)\/$/,
    (config) => {
      const id = Number(/^students\/(\d+)\//.exec(normalisePath(config))![1]);
      const student = db.students.find((item) => item.id === id);
      if (!student) throw new MockHttpError(404, { detail: "Student not found." });
      return student;
    },
  ],
  [
    "post",
    /^students\/$/,
    (config) => {
      const input = body<Student>(config);
      if (db.students.some((student) => student.roll_number === input.roll_number)) {
        throw new MockHttpError(400, {
          roll_number: ["This roll number is already in use."],
        });
      }
      const created: Student = {
        ...input,
        id: makeId(),
        user: makeId(),
        department_name: departmentName(input.department),
        cgpa: 0,
        enrolled_on: new Date().toISOString().slice(0, 10),
      };
      db.students.push(created);
      return created;
    },
  ],
  [
    "patch",
    /^students\/(\d+)\/$/,
    (config) => {
      const id = Number(/^students\/(\d+)\//.exec(normalisePath(config))![1]);
      const index = db.students.findIndex((student) => student.id === id);
      if (index < 0) throw new MockHttpError(404, { detail: "Student not found." });
      const patch = body<Partial<Student>>(config);
      db.students[index] = {
        ...db.students[index],
        ...patch,
        department_name: patch.department
          ? departmentName(patch.department)
          : db.students[index].department_name,
      };
      return db.students[index];
    },
  ],
  [
    "delete",
    /^students\/(\d+)\/$/,
    (config) => {
      const id = Number(/^students\/(\d+)\//.exec(normalisePath(config))![1]);
      db.students = db.students.filter((student) => student.id !== id);
      return null;
    },
  ],

  // Enrollments -----------------------------------------------------------
  [
    "get",
    /^enrollments\/$/,
    (config) => {
      const query = params(config);
      return db.enrollments.filter((enrollment) => {
        if (query.student && enrollment.student !== Number(query.student)) return false;
        if (query.status && enrollment.status !== query.status) return false;
        return true;
      });
    },
  ],
  [
    "post",
    /^enrollments\/$/,
    (config) => {
      const { course: courseId } = body<{ course: number }>(config);
      const course = db.courses.find((item) => item.id === courseId);
      if (!course) throw badRequest("Select a valid course.");
      if (course.enrolled_count >= course.capacity) {
        throw badRequest(`${course.code} is full.`);
      }
      const already = db.enrollments.some(
        (enrollment) =>
          enrollment.student === CURRENT_STUDENT_ID && enrollment.course === courseId,
      );
      if (already) throw badRequest("You have already registered for this course.");

      const student = db.students.find((item) => item.id === CURRENT_STUDENT_ID)!;
      const created: Enrollment = {
        id: makeId(),
        student: student.id,
        student_name: student.full_name,
        roll_number: student.roll_number,
        course: course.id,
        course_code: course.code,
        course_title: course.title,
        credit_units: course.credit_units,
        session: fixtures.SESSION,
        semester: course.semester,
        status: "pending",
        created_at: new Date().toISOString(),
      };
      db.enrollments.push(created);
      course.enrolled_count += 1;
      return created;
    },
  ],
  [
    "delete",
    /^enrollments\/(\d+)\/$/,
    (config) => {
      const id = Number(/^enrollments\/(\d+)\//.exec(normalisePath(config))![1]);
      const enrollment = db.enrollments.find((item) => item.id === id);
      if (enrollment) {
        const course = db.courses.find((item) => item.id === enrollment.course);
        if (course) course.enrolled_count = Math.max(0, course.enrolled_count - 1);
      }
      db.enrollments = db.enrollments.filter((item) => item.id !== id);
      return null;
    },
  ],
  [
    "post",
    /^enrollments\/(\d+)\/(approve|reject)\/$/,
    (config) => {
      const path = normalisePath(config);
      const [, rawId, action] = /^enrollments\/(\d+)\/(approve|reject)\//.exec(path)!;
      const enrollment = db.enrollments.find((item) => item.id === Number(rawId));
      if (!enrollment) throw new MockHttpError(404, { detail: "Enrollment not found." });
      enrollment.status = action === "approve" ? "approved" : "rejected";

      // Approving opens a gradebook row, the way a post_save signal would.
      if (action === "approve" && !db.grades.some((g) => g.enrollment === enrollment.id)) {
        db.grades.push({
          id: makeId(),
          enrollment: enrollment.id,
          student: enrollment.student,
          student_name: enrollment.student_name,
          roll_number: enrollment.roll_number,
          course: enrollment.course,
          course_code: enrollment.course_code,
          course_title: enrollment.course_title,
          credit_units: enrollment.credit_units,
          session: enrollment.session,
          semester: enrollment.semester,
          ca_score: null,
          exam_score: null,
          total_score: null,
          letter_grade: null,
          grade_point: null,
          is_published: false,
        });
      }
      return enrollment;
    },
  ],

  // Grades ----------------------------------------------------------------
  [
    "get",
    /^grades\/my-results\/$/,
    () => {
      const mine = db.grades.filter(
        (grade) => grade.student === CURRENT_STUDENT_ID && grade.is_published,
      );
      const bySession = new Map<string, Grade[]>();
      for (const grade of mine) {
        const key = `${grade.session}|${grade.semester}`;
        bySession.set(key, [...(bySession.get(key) ?? []), grade]);
      }
      const summaries: ResultSummary[] = [...bySession.entries()].map(([key, grades]) => {
        const [session, semester] = key.split("|");
        return {
          session,
          semester: semester as ResultSummary["semester"],
          gpa: gpaFor(grades),
          cgpa: gpaFor(mine),
          total_credit_units: grades.reduce((sum, grade) => sum + grade.credit_units, 0),
          grades,
        };
      });
      return summaries;
    },
  ],
  [
    "get",
    /^grades\/$/,
    (config) => {
      const query = params(config);
      return db.grades.filter((grade) => {
        if (query.course && grade.course !== Number(query.course)) return false;
        if (query.student && grade.student !== Number(query.student)) return false;
        if (query.semester && grade.semester !== query.semester) return false;
        if (query.session && grade.session !== query.session) return false;
        return true;
      });
    },
  ],
  [
    "patch",
    /^grades\/(\d+)\/$/,
    (config) => {
      const id = Number(/^grades\/(\d+)\//.exec(normalisePath(config))![1]);
      const index = db.grades.findIndex((grade) => grade.id === id);
      if (index < 0) throw new MockHttpError(404, { detail: "Grade not found." });
      const { ca_score, exam_score } = body<{
        ca_score: number | null;
        exam_score: number | null;
      }>(config);
      if (ca_score !== null && (ca_score < 0 || ca_score > 30)) {
        throw new MockHttpError(400, { ca_score: ["CA must be between 0 and 30."] });
      }
      if (exam_score !== null && (exam_score < 0 || exam_score > 70)) {
        throw new MockHttpError(400, { exam_score: ["Exam must be between 0 and 70."] });
      }
      db.grades[index] = applyScores(db.grades[index], ca_score, exam_score);
      return db.grades[index];
    },
  ],
  [
    "post",
    /^grades\/publish\/$/,
    (config) => {
      const { ids } = body<{ ids: number[] }>(config);
      let updated = 0;
      for (const grade of db.grades) {
        if (!ids.includes(grade.id)) continue;
        if (grade.total_score === null) {
          throw badRequest(
            `${grade.course_code} for ${grade.student_name} has no complete score yet.`,
          );
        }
        grade.is_published = true;
        updated += 1;
      }
      return { updated };
    },
  ],

  // Finance ---------------------------------------------------------------
  [
    "get",
    /^finance\/my-invoices\/$/,
    () =>
      db.invoices
        .filter((invoice) => invoice.student === CURRENT_STUDENT_ID)
        .map(invoiceStatus),
  ],
  [
    "get",
    /^finance\/invoices\/$/,
    (config) => {
      const query = params(config);
      return db.invoices.map(invoiceStatus).filter((invoice) => {
        if (
          query.search &&
          !matches(
            `${invoice.student_name} ${invoice.roll_number} ${invoice.reference}`,
            query.search,
          )
        ) {
          return false;
        }
        if (query.status && invoice.status !== query.status) return false;
        return true;
      });
    },
  ],
  [
    "post",
    /^finance\/invoices\/$/,
    (config) => {
      const input = body<Invoice>(config);
      const student = db.students.find((item) => item.id === Number(input.student));
      if (!student) throw badRequest("Select a valid student.");
      const created: Invoice = invoiceStatus({
        ...input,
        id: makeId(),
        reference: `INV-2026-${String(db.invoices.length + 1).padStart(4, "0")}`,
        student_name: student.full_name,
        roll_number: student.roll_number,
        amount: Number(input.amount),
        amount_paid: 0,
        balance: Number(input.amount),
        status: "unpaid",
        issued_on: new Date().toISOString().slice(0, 10),
      });
      db.invoices.push(created);
      return created;
    },
  ],
  [
    "get",
    /^finance\/payments\/$/,
    (config) => {
      const query = params(config);
      if (query.invoice) {
        return db.payments.filter((payment) => payment.invoice === Number(query.invoice));
      }
      // The real endpoint scopes an unfiltered list by the token: a student sees
      // only their own payments, an admin sees all. The mock has one student.
      const mine = new Set(
        db.invoices
          .filter((invoice) => invoice.student === CURRENT_STUDENT_ID)
          .map((invoice) => invoice.id),
      );
      return db.payments.filter((payment) => mine.has(payment.invoice));
    },
  ],
  [
    "post",
    /^finance\/payments\/$/,
    (config) => {
      const input = body<Payment>(config);
      const invoice = db.invoices.find((item) => item.id === Number(input.invoice));
      if (!invoice) throw badRequest("Select a valid invoice.");
      const amount = Number(input.amount);
      if (amount <= 0) throw badRequest("Enter an amount greater than zero.");
      if (amount > invoice.amount - invoice.amount_paid) {
        throw badRequest("That is more than the outstanding balance on this invoice.");
      }
      invoice.amount_paid += amount;
      Object.assign(invoice, invoiceStatus(invoice));

      const created: Payment = {
        id: makeId(),
        invoice: invoice.id,
        invoice_reference: invoice.reference,
        amount,
        method: input.method,
        reference: input.reference || `PAY-${makeId()}`,
        paid_at: new Date().toISOString(),
      };
      db.payments.push(created);
      return created;
    },
  ],

  [
    "post",
    /^finance\/pay\/$/,
    (config) => {
      const { amount, method } = body<{ amount: number; method: Payment["method"] }>(config);
      const due = Number(amount);
      if (!due || due <= 0) throw badRequest("Enter an amount greater than zero.");

      const outstanding = db.invoices
        .filter((invoice) => invoice.student === CURRENT_STUDENT_ID)
        .map(invoiceStatus)
        .filter((invoice) => invoice.balance > 0)
        // Oldest due date first, so the most overdue charge clears first.
        .sort((a, b) => a.due_date.localeCompare(b.due_date));

      const owed = outstanding.reduce((sum, invoice) => sum + invoice.balance, 0);
      if (outstanding.length === 0) throw badRequest("Your account is already settled.");
      if (due > owed) {
        throw badRequest("That is more than the balance outstanding on your account.");
      }

      const created: Payment[] = [];
      let remaining = due;

      for (const summary of outstanding) {
        if (remaining <= 0) break;
        const invoice = db.invoices.find((item) => item.id === summary.id)!;
        const applied = Math.min(remaining, summary.balance);

        invoice.amount_paid += applied;
        Object.assign(invoice, invoiceStatus(invoice));
        remaining -= applied;

        const payment: Payment = {
          id: makeId(),
          invoice: invoice.id,
          invoice_reference: invoice.reference,
          amount: applied,
          method,
          reference: `PAY-${makeId()}`,
          paid_at: new Date().toISOString(),
        };
        db.payments.push(payment);
        created.push(payment);
      }

      const result: PaymentResult = {
        amount_paid: due,
        payments: created,
        balance: Number((owed - due).toFixed(2)),
      };
      return result;
    },
  ],

  // Dashboards ------------------------------------------------------------
  [
    "get",
    /^dashboard\/admin\/$/,
    () => {
      const priced = db.invoices.map(invoiceStatus);
      const levels = [...new Set(db.students.map((student) => student.level))].sort();
      const stats: AdminDashboardStats = {
        total_students: db.students.length,
        total_courses: db.courses.length,
        total_departments: db.departments.length,
        pending_enrollments: db.enrollments.filter((e) => e.status === "pending").length,
        outstanding_fees: priced.reduce((sum, invoice) => sum + invoice.balance, 0),
        collected_fees: priced.reduce((sum, invoice) => sum + invoice.amount_paid, 0),
        enrollment_by_level: levels.map((level) => ({
          level,
          count: db.students.filter((student) => student.level === level).length,
        })),
      };
      return stats;
    },
  ],
  [
    "get",
    /^dashboard\/student\/$/,
    () => {
      const mine = db.enrollments.filter(
        (enrollment) =>
          enrollment.student === CURRENT_STUDENT_ID && enrollment.status === "approved",
      );
      const courseIds = mine.map((enrollment) => enrollment.course);
      const myGrades = db.grades.filter(
        (grade) => grade.student === CURRENT_STUDENT_ID && grade.is_published,
      );
      const balance = db.invoices
        .filter((invoice) => invoice.student === CURRENT_STUDENT_ID)
        .map(invoiceStatus)
        .reduce((sum, invoice) => sum + invoice.balance, 0);

      const order = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
      const today = order[Math.max(0, new Date().getDay() - 1)];
      const mySlots = db.slots.filter((slot) => courseIds.includes(slot.course));
      const upcoming =
        mySlots.find((slot) => slot.day === today) ??
        [...mySlots].sort(
          (a, b) => order.indexOf(a.day) - order.indexOf(b.day),
        )[0] ?? null;

      const stats: StudentDashboardStats = {
        cgpa: gpaFor(myGrades),
        registered_courses: mine.length,
        credit_units: mine.reduce((sum, enrollment) => sum + enrollment.credit_units, 0),
        outstanding_balance: balance,
        next_class: upcoming,
        announcements: fixtures.announcements,
      };
      return stats;
    },
  ],
];

/**
 * Installed as `api.defaults.adapter`, so it sees every request the app makes.
 */
export const mockAdapter: AxiosAdapter = async (config) => {
  await delay();

  const method = (config.method ?? "get").toLowerCase();
  const path = normalisePath(config);
  const route = routes.find(([verb, pattern]) => verb === method && pattern.test(path));

  if (!route) {
    return Promise.reject(
      Object.assign(new Error(`Mock API: no handler for ${method.toUpperCase()} /${path}`), {
        isAxiosError: true,
        config,
        response: ok({ detail: `Unhandled mock route: ${path}` }, config, 404),
      }),
    );
  }

  try {
    const data = route[2](config);
    const created = method === "post" && !path.includes("auth/") && !path.includes("publish");
    return ok(data, config, data === null ? 204 : created ? 201 : 200);
  } catch (error) {
    if (error instanceof MockHttpError) {
      return Promise.reject(
        Object.assign(new Error(error.message), {
          isAxiosError: true,
          config,
          response: ok(error.payload, config, error.status),
        }),
      );
    }
    throw error;
  }
};

/** Exposed for the dev banner so the UI can say which credentials work. */
export const mockCredentials = fixtures.users.map(({ email, password, role }) => ({
  email,
  password,
  role,
}));

export { endpoints };
