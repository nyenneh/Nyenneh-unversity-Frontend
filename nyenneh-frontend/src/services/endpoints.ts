/**
 * Every backend path the portal talks to, in one place.
 *
 * These mirror the Django URLconf exactly. Nothing else in the app hard-codes a
 * URL, so a route change on the server is a one-file change here.
 */
export const endpoints = {
  auth: {
    login: "auth/login/",
    refresh: "auth/refresh/",
    me: "auth/me/",
    changePassword: "auth/change-password/",
  },
  faculties: {
    list: "academic/faculties/",
    detail: (id: number) => `academic/faculties/${id}/`,
  },
  departments: {
    list: "academic/departments/",
    detail: (id: number) => `academic/departments/${id}/`,
  },
  programmes: {
    list: "academic/programmes/",
    detail: (id: number) => `academic/programmes/${id}/`,
  },
  sessions: {
    list: "academic/sessions/",
    current: "academic/sessions/current/",
  },
  semesters: {
    list: "academic/semesters/",
    current: "academic/semesters/current/",
  },
  courses: {
    list: "academic/courses/",
    detail: (id: number) => `academic/courses/${id}/`,
  },
  slots: {
    list: "academic/class-slots/",
    detail: (id: number) => `academic/class-slots/${id}/`,
    /** Class times for the signed-in student's approved courses. */
    mySchedule: "academic/class-slots/my-schedule/",
  },
  lecturers: {
    /** The accounts list, filtered by role. */
    list: "auth/users/",
    /** Creates the account and its teaching load in one call. */
    onboard: "academic/lecturers/",
    detail: (id: number) => `auth/users/${id}/`,
    /** Issues a fresh temporary password and emails it. */
    resendPassword: (id: number) => `auth/users/${id}/resend-password/`,
    /** Puts a deactivated account back in service. */
    activate: (id: number) => `auth/users/${id}/activate/`,
  },
  allocations: {
    list: "academic/allocations/",
    detail: (id: number) => `academic/allocations/${id}/`,
    /** Gives one lecturer a whole teaching load; safe to re-submit. */
    assign: "academic/allocations/assign/",
  },
  attendance: {
    meetings: "attendance/meetings/",
    meetingDetail: (id: number) => `attendance/meetings/${id}/`,
    /** The class list for one meeting, marked or not. */
    register: (id: number) => `attendance/meetings/${id}/register/`,
    takeRegister: "attendance/records/take-register/",
    courseSummary: "attendance/records/course-summary/",
    /** The signed-in student's own attendance, course by course. */
    myAttendance: "attendance/records/my-attendance/",
  },
  quizzes: {
    list: "quizzes/quizzes/",
    detail: (id: number) => `quizzes/quizzes/${id}/`,
    markSheet: (id: number) => `quizzes/quizzes/${id}/mark-sheet/`,
    scores: "quizzes/scores/",
    bulkEntry: "quizzes/scores/bulk-entry/",
    /** Quiz performance scaled to a suggested CA mark. */
    suggestedCa: "quizzes/scores/suggested-ca/",
    myScores: "quizzes/scores/my-scores/",
  },
  students: {
    list: "students/",
    detail: (id: number) => `students/${id}/`,
    me: "students/me/",
  },
  enrollments: {
    list: "enrollments/",
    detail: (id: number) => `enrollments/${id}/`,
    approve: (id: number) => `enrollments/${id}/approve/`,
    reject: (id: number) => `enrollments/${id}/reject/`,
  },
  grades: {
    list: "grades/results/",
    detail: (id: number) => `grades/results/${id}/`,
    publish: "grades/results/publish/",
    /** The class list for a course with marks so far, plus CA suggestions. */
    markSheet: "grades/results/mark-sheet/",
    bulkEntry: "grades/results/bulk-entry/",
    /** Published results plus the GPA/CGPA summary, per semester. */
    myResults: "grades/semester-results/my-results/",
  },
  finance: {
    invoices: "finance/invoices/",
    invoiceDetail: (id: number) => `finance/invoices/${id}/`,
    /** Bills a session's fee structure to a student or a whole cohort. */
    generateInvoices: "finance/invoices/generate/",
    payments: "finance/payments/",
    confirmPayment: (id: number) => `finance/payments/${id}/confirm/`,
    /** Student settles their own balance; the server allocates it to invoices. */
    pay: "finance/invoices/pay/",
  },
  dashboard: {
    admin: "dashboard/admin/",
    student: "dashboard/student/",
    lecturer: "dashboard/lecturer/",
  },
} as const;
