// Every backend path in one place, mirroring the Django URLconf. Nothing else
// in the app hard-codes a URL, so a route change on the server is one edit here.
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
    // class times for the signed-in student's approved courses
    mySchedule: "academic/class-slots/my-schedule/",
  },
  lecturers: {
    list: "auth/users/", // filtered by role=LECTURER
    onboard: "academic/lecturers/", // makes the account and the teaching load together
    detail: (id: number) => `auth/users/${id}/`,
    resendPassword: (id: number) => `auth/users/${id}/resend-password/`,
    activate: (id: number) => `auth/users/${id}/activate/`,
  },
  allocations: {
    list: "academic/allocations/",
    detail: (id: number) => `academic/allocations/${id}/`,
    // hands one lecturer a whole load at once, safe to re-submit
    assign: "academic/allocations/assign/",
  },
  attendance: {
    meetings: "attendance/meetings/",
    meetingDetail: (id: number) => `attendance/meetings/${id}/`,
    register: (id: number) => `attendance/meetings/${id}/register/`,
    takeRegister: "attendance/records/take-register/",
    courseSummary: "attendance/records/course-summary/",
    myAttendance: "attendance/records/my-attendance/",
  },
  quizzes: {
    list: "quizzes/quizzes/",
    detail: (id: number) => `quizzes/quizzes/${id}/`,
    markSheet: (id: number) => `quizzes/quizzes/${id}/mark-sheet/`,
    scores: "quizzes/scores/",
    bulkEntry: "quizzes/scores/bulk-entry/",
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
    // class list for a course with the marks so far and the CA suggestions
    markSheet: "grades/results/mark-sheet/",
    bulkEntry: "grades/results/bulk-entry/",
    myResults: "grades/semester-results/my-results/",
  },
  finance: {
    invoices: "finance/invoices/",
    invoiceDetail: (id: number) => `finance/invoices/${id}/`,
    // bills a session's fee structure to one student or a whole cohort
    generateInvoices: "finance/invoices/generate/",
    payments: "finance/payments/",
    confirmPayment: (id: number) => `finance/payments/${id}/confirm/`,
    // student pays off their balance, the server decides which invoices it clears
    pay: "finance/invoices/pay/",
  },
  dashboard: {
    admin: "dashboard/admin/",
    student: "dashboard/student/",
    lecturer: "dashboard/lecturer/",
  },
} as const;
