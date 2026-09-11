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
  },
} as const;
