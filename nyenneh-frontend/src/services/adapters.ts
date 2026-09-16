/**
 * Translation between the Django REST payloads and the portal's domain model.
 *
 * The two vocabularies differ in three ways, and every difference is resolved
 * here so no page or hook ever sees a raw API field:
 *
 *   - names      `phone_number` -> `phone`
 *   - enums      `"ACTIVE"` -> `"active"`, `semester_number: 1` -> `"first"`
 *   - numbers    DRF renders DecimalField as a JSON *string* ("45000.00"), and
 *                the UI does arithmetic on these, so they are coerced on the
 *                way in.
 *
 * Keeping this in one module means a server-side rename is a change here rather
 * than a change in fourteen components.
 */

import type {
  AcademicSession,
  AttendanceRecord,
  AttendanceStatus,
  CaSuggestion,
  ClassMeeting,
  ClassSlot,
  Course,
  CourseAllocation,
  Department,
  Enrollment,
  EnrollmentStatus,
  Faculty,
  Grade,
  Invoice,
  InvoiceStatus,
  Lecturer,
  LecturerAccount,
  LecturerCourse,
  Payment,
  PaymentMethod,
  PaymentStatus,
  Programme,
  Quiz,
  QuizScore,
  Role,
  Semester,
  SemesterTerm,
  Student,
  StudentStatus,
  User,
  Weekday,
} from "@/types";

/* -------------------------------------------------------------------------- */
/* primitives                                                                  */
/* -------------------------------------------------------------------------- */

/** DRF decimals arrive as strings; `null` and `""` both mean "not set". */
export function num(value: unknown): number {
  if (value === null || value === undefined || value === "") return 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

/** Like `num`, but preserves "no score recorded" as null rather than zero. */
function nullableNum(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function str(value: unknown): string {
  return typeof value === "string" ? value : "";
}

/** Empty strings are how Django stores "blank"; the UI wants an explicit null. */
function blankToNull(value: unknown): string | null {
  const text = str(value).trim();
  return text === "" ? null : text;
}

/* -------------------------------------------------------------------------- */
/* enums                                                                       */
/* -------------------------------------------------------------------------- */

export const toSemester = (n: unknown): Semester =>
  Number(n) === 2 ? "second" : "first";

export const fromSemester = (semester: Semester | string): 1 | 2 =>
  semester === "second" ? 2 : 1;

const ROLES: Record<string, Role> = {
  STUDENT: "student",
  LECTURER: "lecturer",
  ADMIN: "admin",
};

const STUDENT_STATUSES: Record<string, StudentStatus> = {
  ACTIVE: "active",
  GRADUATED: "graduated",
  DEFERRED: "deferred",
  SUSPENDED: "suspended",
  WITHDRAWN: "withdrawn",
};

const ENROLLMENT_STATUSES: Record<string, EnrollmentStatus> = {
  PENDING: "pending",
  REGISTERED: "registered",
  REJECTED: "rejected",
  DROPPED: "dropped",
};

/** The API numbers weekdays from Monday; the UI names them. */
const WEEKDAYS: Weekday[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

export const toWeekday = (n: unknown): Weekday =>
  WEEKDAYS[num(n) - 1] ?? "monday";

export const fromWeekday = (day: Weekday): number =>
  Math.max(1, WEEKDAYS.indexOf(day) + 1);

const INVOICE_STATUSES: Record<string, InvoiceStatus> = {
  PENDING: "pending",
  PARTIAL: "partial",
  PAID: "paid",
  CANCELLED: "cancelled",
};

const PAYMENT_METHODS: Record<string, PaymentMethod> = {
  BANK: "bank_transfer",
  CARD: "card",
  CASH: "cash",
  USSD: "ussd",
  WAIVER: "waiver",
};

const PAYMENT_STATUSES: Record<string, PaymentStatus> = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  FAILED: "failed",
  REVERSED: "reversed",
};

/** Invert a code table so the UI's vocabulary can be sent back to the server. */
function invert<T extends string>(table: Record<string, T>): Record<T, string> {
  return Object.fromEntries(
    Object.entries(table).map(([code, value]) => [value, code]),
  ) as Record<T, string>;
}

const STUDENT_STATUS_CODES = invert(STUDENT_STATUSES);
const PAYMENT_METHOD_CODES = invert(PAYMENT_METHODS);
const ENROLLMENT_STATUS_CODES = invert(ENROLLMENT_STATUSES);

export const fromEnrollmentStatus = (status: EnrollmentStatus): string =>
  ENROLLMENT_STATUS_CODES[status] ?? "PENDING";

export const fromStudentStatus = (status: StudentStatus): string =>
  STUDENT_STATUS_CODES[status] ?? "ACTIVE";

export const fromPaymentMethod = (method: PaymentMethod): string =>
  PAYMENT_METHOD_CODES[method] ?? "BANK";

/* -------------------------------------------------------------------------- */
/* accounts                                                                    */
/* -------------------------------------------------------------------------- */

export interface ApiUser {
  id: number;
  email: string;
  full_name: string;
  role: string;
  is_staff: boolean;
  must_change_password: boolean;
}

/**
 * The account endpoint knows nothing about roll numbers — that lives
 * on the student record — so callers that have one pass it in.
 */
export function toUser(api: ApiUser, rollNumber?: string | null): User {
  return {
    id: api.id,
    email: api.email,
    full_name: api.full_name,
    // A Django superuser may carry any role; staff access is what matters here.
    role: api.is_staff ? "admin" : (ROLES[api.role] ?? "student"),
    roll_number: rollNumber ?? null,
    must_change_password: Boolean(api.must_change_password),
  };
}

/* -------------------------------------------------------------------------- */
/* academic                                                                    */
/* -------------------------------------------------------------------------- */

export function toFaculty(api: Record<string, unknown>): Faculty {
  return { id: num(api.id), name: str(api.name), code: str(api.code) };
}

export function toDepartment(api: Record<string, unknown>): Department {
  return {
    id: num(api.id),
    name: str(api.name),
    code: str(api.code),
    description: str(api.description),
    faculty: num(api.faculty),
    faculty_name: str(api.faculty_name),
    course_count: num(api.course_count),
    student_count: num(api.student_count),
  };
}

export function toProgramme(api: Record<string, unknown>): Programme {
  return {
    id: num(api.id),
    name: str(api.name),
    code: str(api.code),
    department: num(api.department),
    department_name: str(api.department_name),
    degree_type_display: str(api.degree_type_display),
    max_level: num(api.max_level),
    is_active: Boolean(api.is_active),
  };
}

export function toSession(api: Record<string, unknown>): AcademicSession {
  return {
    id: num(api.id),
    name: str(api.name),
    is_current: Boolean(api.is_current),
  };
}

export function toSemesterTerm(api: Record<string, unknown>): SemesterTerm {
  return {
    id: num(api.id),
    session: num(api.session),
    session_name: str(api.session_name),
    number: num(api.number) === 2 ? 2 : 1,
    registration_is_open: Boolean(api.registration_is_open),
    is_current: Boolean(api.is_current),
  };
}

/** `null` and `undefined` both mean "no seat limit"; 0 is a real answer. */
function nullableCount(value: unknown): number | null {
  return value === null || value === undefined ? null : num(value);
}

export function toCourse(api: Record<string, unknown>): Course {
  return {
    id: num(api.id),
    code: str(api.code),
    title: str(api.title),
    description: str(api.description),
    credit_units: num(api.credit_units),
    level: num(api.level),
    semester: toSemester(api.semester_number),
    department: num(api.department),
    department_name: str(api.department_name),
    capacity: nullableCount(api.capacity),
    enrolled_count: num(api.enrolled_count),
    seats_left: nullableCount(api.seats_left),
    is_active: Boolean(api.is_active),
  };
}

export function toClassSlot(api: Record<string, unknown>): ClassSlot {
  return {
    id: num(api.id),
    course: num(api.course),
    course_code: str(api.course_code),
    course_title: str(api.course_title),
    semester: toSemester(api.semester_number),
    day: toWeekday(api.day),
    // The API sends "10:00:00"; the UI works in "HH:MM".
    start_time: str(api.start_time).slice(0, 5),
    end_time: str(api.end_time).slice(0, 5),
    venue: str(api.venue),
    lecturer: api.lecturer === null || api.lecturer === undefined ? null : num(api.lecturer),
    lecturer_name: str(api.lecturer_name),
    duration_hours: num(api.duration_hours),
  };
}

export function toLecturer(api: Record<string, unknown>): Lecturer {
  return {
    id: num(api.id),
    full_name: str(api.full_name),
    email: str(api.email),
  };
}

export function toLecturerAccount(api: Record<string, unknown>): LecturerAccount {
  return {
    id: num(api.id),
    email: str(api.email),
    full_name: str(api.full_name),
    title: str(api.title),
    first_name: str(api.first_name),
    middle_name: str(api.middle_name),
    last_name: str(api.last_name),
    phone_number: str(api.phone_number),
    // A missing flag must not read as "deactivated", so default to active.
    is_active: api.is_active === undefined ? true : Boolean(api.is_active),
    must_change_password: Boolean(api.must_change_password),
    last_login: blankToNull(api.last_login),
    date_joined: blankToNull(api.date_joined),
  };
}

/* -------------------------------------------------------------------------- */
/* students                                                                    */
/* -------------------------------------------------------------------------- */

export function toStudent(api: Record<string, unknown>): Student {
  return {
    id: num(api.id),
    user: num(api.user),
    roll_number: str(api.roll_number),

    full_name: str(api.full_name),
    email: str(api.email),
    phone: blankToNull(api.phone_number),
    date_of_birth: blankToNull(api.date_of_birth),
    gender: (str(api.gender) || "") as Student["gender"],
    address: blankToNull(api.address),
    guardian_name: blankToNull(api.guardian_name),
    guardian_phone: blankToNull(api.guardian_phone),

    level: num(api.level),
    programme: num(api.programme),
    programme_name: str(api.programme_name),
    // The roster's list serializer is trimmed and omits the department.
    department_name: str(api.department_name),
    entry_session: num(api.entry_session),
    entry_session_name: str(api.entry_session_name),
    status: STUDENT_STATUSES[str(api.status)] ?? "active",
    enrolled_on: str(api.admitted_on),
  };
}

export function toEnrollment(api: Record<string, unknown>): Enrollment {
  return {
    id: num(api.id),
    student: num(api.student),
    student_name: str(api.student_name),
    roll_number: str(api.roll_number),
    course: num(api.course),
    course_code: str(api.course_code),
    course_title: str(api.course_title),
    credit_units: num(api.credit_units),
    session: str(api.session_name),
    semester: toSemester(api.semester_number),
    level: num(api.level),
    is_carryover: Boolean(api.is_carryover),
    status: ENROLLMENT_STATUSES[str(api.status)] ?? "pending",
    reviewed_on: blankToNull(api.reviewed_on),
    reviewed_by_name: blankToNull(api.reviewed_by_name),
    review_note: str(api.review_note),
    created_at: str(api.registered_on) || str(api.created_at),
  };
}

/* -------------------------------------------------------------------------- */
/* grades                                                                      */
/* -------------------------------------------------------------------------- */

export function toGrade(api: Record<string, unknown>): Grade {
  return {
    id: num(api.id),
    enrollment: num(api.enrollment),
    student: num(api.student),
    student_name: str(api.student_name),
    roll_number: str(api.roll_number),
    course: num(api.course),
    course_code: str(api.course_code),
    course_title: str(api.course_title),
    credit_units: num(api.credit_units),
    session: str(api.session_name),
    semester: toSemester(api.semester_number),
    ca_score: nullableNum(api.ca_score),
    exam_score: nullableNum(api.exam_score),
    total_score: nullableNum(api.total_score),
    letter_grade: blankToNull(api.letter_grade),
    grade_point: nullableNum(api.grade_point),
    is_published: Boolean(api.is_published),
  };
}

/* -------------------------------------------------------------------------- */
/* finance                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * An unsettled invoice past its due date reads as "overdue" in the UI, which is
 * a presentation state rather than one the server stores.
 */
function invoiceStatus(api: Record<string, unknown>): InvoiceStatus {
  const stored = INVOICE_STATUSES[str(api.status)] ?? "pending";
  if (api.is_overdue && stored !== "paid" && stored !== "cancelled") {
    return "overdue";
  }
  return stored;
}

export function toInvoice(api: Record<string, unknown>): Invoice {
  const total = num(api.total_amount);
  const paid = num(api.amount_paid);
  return {
    id: num(api.id),
    reference: str(api.reference),
    student: num(api.student),
    student_name: str(api.student_name),
    roll_number: str(api.roll_number),
    // Invoices are itemised on the server; the note is the human label, and the
    // session stands in when the bursary left it blank.
    description: blankToNull(api.note) ?? `Fees — ${str(api.session_name)}`,
    session: str(api.session_name),
    semester: toSemester(api.semester_number),
    amount: total,
    amount_paid: paid,
    // `balance` is a serializer field, but deriving it here keeps the three
    // figures internally consistent even on a trimmed payload.
    balance: total - paid,
    status: invoiceStatus(api),
    due_date: blankToNull(api.due_date),
    issued_on: str(api.issued_on),
  };
}

export function toPayment(api: Record<string, unknown>): Payment {
  return {
    id: num(api.id),
    invoice: num(api.invoice),
    invoice_reference: str(api.invoice_reference),
    student_name: str(api.student_name),
    amount: num(api.amount),
    method: PAYMENT_METHODS[str(api.method)] ?? "bank_transfer",
    status: PAYMENT_STATUSES[str(api.status)] ?? "pending",
    reference: str(api.reference),
    // An unconfirmed payment has no confirmation timestamp; the date it was
    // banked is the closest honest answer.
    paid_at: str(api.confirmed_at) || str(api.paid_on),
  };
}

/* -------------------------------------------------------------------------- */
/* lecturer                                                                    */
/* -------------------------------------------------------------------------- */

const ATTENDANCE_STATUSES: Record<string, AttendanceStatus> = {
  PRESENT: "present",
  ABSENT: "absent",
  LATE: "late",
  EXCUSED: "excused",
};

const ATTENDANCE_STATUS_CODES = invert(ATTENDANCE_STATUSES);

export const fromAttendanceStatus = (status: AttendanceStatus): string =>
  ATTENDANCE_STATUS_CODES[status] ?? "PRESENT";

export function toCourseAllocation(api: Record<string, unknown>): CourseAllocation {
  // The list serializer nests the course; the counts sit on the row itself.
  const course = (api.course_detail ?? {}) as Record<string, unknown>;
  return {
    id: num(api.id),
    lecturer: num(api.lecturer),
    lecturer_name: str(api.lecturer_name),
    course: num(api.course),
    course_code: str(course.code),
    course_title: str(course.title),
    semester: num(api.semester),
    semester_name: str(api.semester_name),
    student_count: num(api.student_count),
    is_active: Boolean(api.is_active),
  };
}

export function toLecturerCourse(api: Record<string, unknown>): LecturerCourse {
  return {
    allocation: num(api.allocation),
    course: num(api.course),
    course_code: str(api.course_code),
    course_title: str(api.course_title),
    credit_units: num(api.credit_units),
    level: num(api.level),
    semester: num(api.semester),
    semester_name: str(api.semester_name),
    student_count: num(api.student_count),
    pending_enrollments: num(api.pending_enrollments),
    graded_count: num(api.graded_count),
    ungraded_count: num(api.ungraded_count),
    quiz_count: num(api.quiz_count),
    meetings_held: num(api.meetings_held),
    attendance_rate: num(api.attendance_rate),
  };
}

export function toClassMeeting(api: Record<string, unknown>): ClassMeeting {
  return {
    id: num(api.id),
    course: num(api.course),
    course_code: str(api.course_code),
    course_title: str(api.course_title),
    semester: num(api.semester),
    semester_name: str(api.semester_name),
    slot: api.slot === null || api.slot === undefined ? null : num(api.slot),
    day: str(api.day),
    venue: str(api.venue),
    held_on: str(api.held_on),
    topic: str(api.topic),
    taken_by_name: str(api.taken_by_name),
    expected: num(api.expected),
    marked_count: num(api.marked_count),
    present_count: num(api.present_count),
  };
}

export function toAttendanceRecord(api: Record<string, unknown>): AttendanceRecord {
  return {
    id: num(api.id),
    meeting: num(api.meeting),
    enrollment: num(api.enrollment),
    student: num(api.student),
    student_name: str(api.student_name),
    roll_number: str(api.roll_number),
    course_code: str(api.course_code),
    held_on: str(api.held_on),
    status: ATTENDANCE_STATUSES[str(api.status)] ?? "present",
    note: str(api.note),
  };
}

export function toQuiz(api: Record<string, unknown>): Quiz {
  return {
    id: num(api.id),
    course: num(api.course),
    course_code: str(api.course_code),
    course_title: str(api.course_title),
    semester: num(api.semester),
    semester_name: str(api.semester_name),
    title: str(api.title),
    description: str(api.description),
    max_score: num(api.max_score),
    held_on: blankToNull(api.held_on),
    is_published: Boolean(api.is_published),
    scored_count: num(api.scored_count),
  };
}

export function toQuizScore(api: Record<string, unknown>): QuizScore {
  return {
    id: num(api.id),
    quiz: num(api.quiz),
    quiz_title: str(api.quiz_title),
    course_code: str(api.course_code),
    enrollment: num(api.enrollment),
    student: num(api.student),
    student_name: str(api.student_name),
    roll_number: str(api.roll_number),
    score: num(api.score),
    max_score: num(api.max_score),
    percentage: num(api.percentage),
    remark: str(api.remark),
  };
}

/** Null rather than zeroes: a student who has sat nothing has no suggestion. */
export function toCaSuggestion(api: unknown): CaSuggestion | null {
  if (!api || typeof api !== "object") return null;
  const row = api as Record<string, unknown>;
  return {
    quizzes_taken: num(row.quizzes_taken),
    scored: num(row.scored),
    possible: num(row.possible),
    percentage: num(row.percentage),
    suggested_ca: num(row.suggested_ca),
  };
}
