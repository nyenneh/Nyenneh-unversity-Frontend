// Types used across the whole portal.
// snake_case because that is what DRF hands back. These are not the raw
// payloads though - services/adapters.ts maps between the two, so nothing
// outside that file should have to know a backend field name.

export type Role = "student" | "admin" | "lecturer";

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: Role;
  roll_number?: string | null; // students only
  avatar_url?: string | null;
  must_change_password: boolean; // true while they are still on the emailed password
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

// a programme students are admitted into, e.g. BSc Computer Science
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

// an academic year, e.g. 2025/2026
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
  capacity: number | null; // null = unlimited
  // approved registrations plus the ones still pending
  enrolled_count: number;
  seats_left: number | null; // null whenever capacity is
  is_active: boolean;
}

export type Weekday =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday";

// one weekly meeting of a course: day, time, room
export interface ClassSlot {
  id: number;
  course: number;
  course_code: string;
  course_title: string;
  semester: Semester;
  day: Weekday;
  start_time: string; // "HH:MM", 24 hour
  end_time: string;
  venue: string;
  lecturer: number | null; // null until someone is assigned
  lecturer_name: string;
  duration_hours: number;
}

export interface Lecturer {
  id: number;
  full_name: string;
  email: string;
}

// The full lecturer account, for the admin roster. `Lecturer` above is the
// trimmed version the course and allocation pickers use.
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
  date_of_birth: string | null; // "YYYY-MM-DD", optional on the server
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

// requested, then approved or refused by the registry. "dropped" is the
// student pulling out of something that was already approved.
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
  review_note: string; // why it was refused, if it was
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
  // both entered by the lecturer, CA out of 40 and exam out of 60
  ca_score: number | null;
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

// "overdue" is not stored on the server, we work it out from an unpaid
// invoice whose due date has gone by
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

// money is recorded first and confirmed after; only confirmed money counts
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

// what comes back after a student pays something off
export interface PaymentResult {
  amount_paid: number;
  payments: Payment[]; // one per invoice the money was split across
  balance: number; // what is left owing
}

export interface AdminDashboardStats {
  total_students: number;
  total_courses: number;
  total_departments: number;
  pending_enrollments: number;
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

// DRF's PageNumberPagination envelope
export interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// ---------- lecturer side ----------

// who teaches what, for one semester
export interface CourseAllocation {
  id: number;
  lecturer: number;
  lecturer_name: string;
  course: number;
  course_code: string;
  course_title: string;
  semester: number;
  semester_name: string;
  student_count: number;
  is_active: boolean;
}

// a row on the lecturer dashboard: one course and how it is going
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
  attendance_rate: number; // 0-100
}

export interface LecturerDashboardStats {
  current_semester: string | null;
  courses_allocated: number;
  total_students: number;
  courses: LecturerCourse[];
}

export type AttendanceStatus = "present" | "absent" | "late" | "excused";

// one sitting of a course, i.e. a day it actually met
export interface ClassMeeting {
  id: number;
  course: number;
  course_code: string;
  course_title: string;
  semester: number;
  semester_name: string;
  slot: number | null; // null for an extra class that was not on the timetable
  day: string;
  venue: string;
  held_on: string; // "YYYY-MM-DD"
  topic: string;
  taken_by_name: string;
  expected: number; // students registered at the time
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

// One student's attendance on one course. `counted` leaves out excused
// absences: those come off the denominator instead of counting against them.
export interface AttendanceSummaryRow {
  enrollment: Enrollment;
  present: number;
  absent: number;
  excused: number;
  marked: number;
  counted: number;
  rate: number; // 0-100
}

export interface AttendanceSummary {
  meetings_held: number;
  class_rate: number;
  rows: AttendanceSummaryRow[];
}

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

// a CA test a lecturer sets, marked out of max_score
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
  percentage: number; // of max_score
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

// Quiz results scaled onto the CA marks. Only a suggestion - the lecturer
// still types ca_score in themselves. Nothing sat yet gives no suggestion at
// all rather than a zero.
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
