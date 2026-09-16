/**
 * Domain model shared by the whole portal.
 *
 * Field names are snake_case because they came from Django REST Framework, but
 * these are the portal's own shapes, not the raw API payloads: `services/
 * adapters.ts` maps between the two. Nothing outside that module should need to
 * know a backend field name.
 */

/** Lecturers reach the staff screens; the API decides what they may do there. */
export type Role = "student" | "admin" | "lecturer";

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: Role;
  /** Present only when role === "student". */
  roll_number?: string | null;
  avatar_url?: string | null;
  /** True while the account still holds the password it was emailed. */
  must_change_password: boolean;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface LoginResponse extends AuthTokens {
  user: User;
}

export interface Faculty {
  id: number;
  name: string;
  code: string;
}

export interface Department {
  id: number;
  name: string;
  code: string;
  description: string;
  faculty: number;
  faculty_name: string;
  course_count: number;
  student_count: number;
}

/** A degree programme students are admitted into, e.g. BSc Computer Science. */
export interface Programme {
  id: number;
  name: string;
  code: string;
  department: number;
  department_name: string;
  degree_type_display: string;
  max_level: number;
  is_active: boolean;
}

/** An academic year, e.g. 2025/2026. */
export interface AcademicSession {
  id: number;
  name: string;
  is_current: boolean;
}

export interface SemesterTerm {
  id: number;
  session: number;
  session_name: string;
  number: 1 | 2;
  registration_is_open: boolean;
  is_current: boolean;
}

export type Semester = "first" | "second";

export interface Course {
  id: number;
  code: string;
  title: string;
  description: string;
  credit_units: number;
  level: number;
  semester: Semester;
  department: number;
  department_name: string;
  /** Seats on offer. Null means the course has no limit. */
  capacity: number | null;
  /** Seats held this semester: approved registrations plus pending requests. */
  enrolled_count: number;
  /** Null whenever `capacity` is null. */
  seats_left: number | null;
  is_active: boolean;
}

export type Weekday =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday";

/** One weekly meeting of a course: a day, a time and a room. */
export interface ClassSlot {
  id: number;
  course: number;
  course_code: string;
  course_title: string;
  semester: Semester;
  day: Weekday;
  /** "HH:MM" in 24-hour form. */
  start_time: string;
  end_time: string;
  venue: string;
  /** The lecturer's account id, or null when nobody is assigned yet. */
  lecturer: number | null;
  lecturer_name: string;
  duration_hours: number;
}

/** An account that can be put in front of a class. */
export interface Lecturer {
  id: number;
  full_name: string;
  email: string;
}

/**
 * A lecturer's portal account, as the admin roster manages it.
 *
 * `Lecturer` above is the trimmed shape the course and allocation pickers need;
 * this one carries the account state an admin acts on — whether the login still
 * works, and whether the emailed password has been replaced yet.
 */
export interface LecturerAccount {
  id: number;
  email: string;
  full_name: string;
  title: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  phone_number: string;
  is_active: boolean;
  /** True while the account still holds the password it was emailed. */
  must_change_password: boolean;
  last_login: string | null;
  date_joined: string | null;
}

export type StudentStatus =
  | "active"
  | "graduated"
  | "deferred"
  | "suspended"
  | "withdrawn";

export interface Student {
  id: number;
  user: number;
  roll_number: string;

  /* Personal details */
  full_name: string;
  email: string;
  phone: string | null;
  /** ISO date, "YYYY-MM-DD". Optional on the server. */
  date_of_birth: string | null;
  gender: "M" | "F" | "O" | "";
  address: string | null;
  guardian_name: string | null;
  guardian_phone: string | null;

  /* Academic details */
  level: number;
  programme: number;
  programme_name: string;
  department_name: string;
  entry_session: number;
  entry_session_name: string;
  status: StudentStatus;
  enrolled_on: string;
}

/**
 * A registration is requested, then approved or refused by the registry.
 * "dropped" is the student withdrawing from a course already approved.
 */
export type EnrollmentStatus =
  | "pending"
  | "registered"
  | "rejected"
  | "dropped";

export interface Enrollment {
  id: number;
  student: number;
  student_name: string;
  roll_number: string;
  course: number;
  course_code: string;
  course_title: string;
  credit_units: number;
  session: string;
  semester: Semester;
  level: number;
  is_carryover: boolean;
  status: EnrollmentStatus;
  reviewed_on: string | null;
  reviewed_by_name: string | null;
  /** Why a request was refused, when it was. */
  review_note: string;
  created_at: string;
}

export interface Grade {
  id: number;
  enrollment: number;
  student: number;
  student_name: string;
  roll_number: string;
  course: number;
  course_code: string;
  course_title: string;
  credit_units: number;
  session: string;
  semester: Semester;
  /** 0-40, set by the lecturer. */
  ca_score: number | null;
  /** 0-60, set by the lecturer. */
  exam_score: number | null;
  total_score: number | null;
  letter_grade: string | null;
  grade_point: number | null;
  is_published: boolean;
}

export interface ResultSummary {
  session: string;
  semester: Semester;
  gpa: number;
  cgpa: number;
  total_credit_units: number;
  grades: Grade[];
}

/**
 * "overdue" is not a state the server stores: it is derived from an unsettled
 * invoice whose due date has passed, and is surfaced here so the UI can flag it.
 */
export type InvoiceStatus =
  | "pending"
  | "partial"
  | "paid"
  | "cancelled"
  | "overdue";

export interface Invoice {
  id: number;
  reference: string;
  student: number;
  student_name: string;
  roll_number: string;
  description: string;
  session: string;
  semester: Semester;
  amount: number;
  amount_paid: number;
  balance: number;
  status: InvoiceStatus;
  due_date: string | null;
  issued_on: string;
}

export type PaymentMethod =
  | "bank_transfer"
  | "card"
  | "cash"
  | "ussd"
  | "waiver";

/** Money is recorded first and confirmed second; only confirmed money counts. */
export type PaymentStatus = "pending" | "confirmed" | "failed" | "reversed";

export interface Payment {
  id: number;
  invoice: number;
  invoice_reference: string;
  student_name: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  reference: string;
  paid_at: string;
}

/** Result of a student settling part or all of their outstanding balance. */
export interface PaymentResult {
  amount_paid: number;
  /** One payment per invoice the amount was spread across. */
  payments: Payment[];
  /** What is still owed afterwards. */
  balance: number;
}

export interface AdminDashboardStats {
  total_students: number;
  total_courses: number;
  total_departments: number;
  /** Requests awaiting a decision this semester. */
  pending_enrollments: number;
  /** Approved registrations for the semester marked current. */
  registered_enrollments: number;
  current_semester: string | null;
  outstanding_fees: number;
  collected_fees: number;
  enrollment_by_level: { level: number; count: number }[];
}

export interface StudentDashboardStats {
  cgpa: number;
  registered_courses: number;
  credit_units: number;
  outstanding_balance: number;
  current_semester: string | null;
}

/** DRF pagination envelope (PageNumberPagination). */
export interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

/* -------------------------------------------------------------------------- */
/* lecturer                                                                    */
/* -------------------------------------------------------------------------- */

/** Which lecturer teaches which course, for one semester. */
export interface CourseAllocation {
  id: number;
  lecturer: number;
  lecturer_name: string;
  course: number;
  course_code: string;
  course_title: string;
  semester: number;
  semester_name: string;
  /** Approved registrations on this course for this semester. */
  student_count: number;
  is_active: boolean;
}

/** One row of the lecturer's dashboard: a course and how it is going. */
export interface LecturerCourse {
  allocation: number;
  course: number;
  course_code: string;
  course_title: string;
  credit_units: number;
  level: number;
  semester: number;
  semester_name: string;
  student_count: number;
  pending_enrollments: number;
  graded_count: number;
  ungraded_count: number;
  quiz_count: number;
  meetings_held: number;
  /** Percentage, 0-100. */
  attendance_rate: number;
}

export interface LecturerDashboardStats {
  current_semester: string | null;
  courses_allocated: number;
  total_students: number;
  courses: LecturerCourse[];
}

export type AttendanceStatus = "present" | "absent" | "late" | "excused";

/** One sitting of a course: the day it actually met. */
export interface ClassMeeting {
  id: number;
  course: number;
  course_code: string;
  course_title: string;
  semester: number;
  semester_name: string;
  /** The timetable slot it belongs to, when it was a scheduled class. */
  slot: number | null;
  day: string;
  venue: string;
  /** ISO date, "YYYY-MM-DD". */
  held_on: string;
  topic: string;
  taken_by_name: string;
  /** Students registered for the course when it met. */
  expected: number;
  marked_count: number;
  present_count: number;
}

export interface AttendanceRecord {
  id: number;
  meeting: number;
  enrollment: number;
  student: number;
  student_name: string;
  roll_number: string;
  course_code: string;
  held_on: string;
  status: AttendanceStatus;
  note: string;
}

/** A class list for one meeting: every registered student, marked or not. */
export interface RegisterRow {
  enrollment: Enrollment;
  record: AttendanceRecord | null;
}

export interface Register {
  meeting: ClassMeeting;
  registered: number;
  marked: number;
  rows: RegisterRow[];
}

/**
 * A student's attendance on one course. `counted` excludes excused absences,
 * which are removed from the denominator rather than held against them.
 */
export interface AttendanceSummaryRow {
  enrollment: Enrollment;
  present: number;
  absent: number;
  excused: number;
  marked: number;
  counted: number;
  /** Percentage, 0-100. */
  rate: number;
}

export interface AttendanceSummary {
  meetings_held: number;
  class_rate: number;
  rows: AttendanceSummaryRow[];
}

/** A student's own attendance, one row per registered course. */
export interface MyAttendanceRow {
  course: number;
  course_code: string;
  course_title: string;
  meetings_held: number;
  present: number;
  absent: number;
  excused: number;
  marked: number;
  counted: number;
  rate: number;
}

/** Continuous assessment a lecturer sets, marked out of `max_score`. */
export interface Quiz {
  id: number;
  course: number;
  course_code: string;
  course_title: string;
  semester: number;
  semester_name: string;
  title: string;
  description: string;
  max_score: number;
  held_on: string | null;
  is_published: boolean;
  scored_count: number;
}

export interface QuizScore {
  id: number;
  quiz: number;
  quiz_title: string;
  course_code: string;
  enrollment: number;
  student: number;
  student_name: string;
  roll_number: string;
  score: number;
  max_score: number;
  /** Of the quiz maximum, 0-100. */
  percentage: number;
  remark: string;
}

export interface QuizMarkSheetRow {
  enrollment: Enrollment;
  score: QuizScore | null;
}

export interface QuizMarkSheet {
  quiz: Quiz;
  registered: number;
  scored: number;
  rows: QuizMarkSheetRow[];
}

/**
 * Quiz performance scaled to the CA marks. Advisory only: the lecturer still
 * enters `ca_score`, and a student who has sat nothing gets no suggestion
 * rather than a zero.
 */
export interface CaSuggestion {
  quizzes_taken: number;
  scored: number;
  possible: number;
  percentage: number;
  suggested_ca: number;
}

export interface MarkSheetRow {
  enrollment: Enrollment;
  result: Grade | null;
  suggestion: CaSuggestion | null;
}

export interface MarkSheet {
  graded: number;
  registered: number;
  ca_maximum: number;
  quizzes_published: number;
  rows: MarkSheetRow[];
}
