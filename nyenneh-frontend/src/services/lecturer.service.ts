import { del, get, patch, post, unwrapList } from "./api";
import {
  fromAttendanceStatus,
  num,
  toAttendanceRecord,
  toCaSuggestion,
  toClassMeeting,
  toCourseAllocation,
  toEnrollment,
  toGrade,
  toLecturerCourse,
  toQuiz,
  toQuizScore,
} from "./adapters";
import { endpoints } from "./endpoints";
import type {
  AttendanceStatus,
  AttendanceSummary,
  ClassMeeting,
  CourseAllocation,
  LecturerDashboardStats,
  MarkSheet,
  MyAttendanceRow,
  Quiz,
  QuizMarkSheet,
  QuizScore,
  Register,
} from "@/types";

type Row = Record<string, unknown>;

/** Drops empty filters so the query string carries only what was actually set. */
function params(filters: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(filters).filter(([, value]) => value !== undefined && value !== ""),
  );
}

export interface AllocationFilters {
  lecturer?: number;
  course?: number;
  semester?: number;
  is_active?: boolean;
}

export interface AssignCoursesInput {
  lecturer: number;
  semester: number;
  courses: number[];
}

export interface MeetingInput {
  course: number;
  semester: number;
  held_on: string;
  topic?: string;
  slot?: number | null;
}

export interface RegisterEntry {
  enrollment: number;
  status: AttendanceStatus;
  note?: string;
}

export interface QuizInput {
  course: number;
  semester: number;
  title: string;
  description?: string;
  max_score: number;
  held_on?: string | null;
  is_published?: boolean;
}

export interface QuizScoreEntry {
  enrollment: number;
  score: number;
  remark?: string;
}

export interface ResultEntry {
  enrollment: number;
  ca_score: number;
  exam_score: number;
  remark?: string;
}

export const lecturerService = {
  /* -- dashboard & allocations ------------------------------------------- */

  dashboard: async (): Promise<LecturerDashboardStats> => {
    const data = await get<Row>(endpoints.dashboard.lecturer);
    return {
      current_semester: (data.current_semester as string | null) ?? null,
      courses_allocated: num(data.courses_allocated),
      total_students: num(data.total_students),
      courses: ((data.courses as Row[]) ?? []).map(toLecturerCourse),
    };
  },

  /** A lecturer gets only their own load; the server filters by account. */
  listAllocations: async (filters: AllocationFilters = {}): Promise<CourseAllocation[]> => {
    const data = await get<Row[] | { results: Row[] }>(endpoints.allocations.list, {
      params: params({ ...filters }),
    });
    return unwrapList(data).map(toCourseAllocation);
  },

  assignCourses: async (input: AssignCoursesInput) => {
    const data = await post<Row>(endpoints.allocations.assign, input);
    return {
      detail: String(data.detail ?? ""),
      created: num(data.created),
      reactivated: num(data.reactivated),
      unchanged: num(data.unchanged),
      allocations: ((data.allocations as Row[]) ?? []).map(toCourseAllocation),
    };
  },

  removeAllocation: (id: number) => del(endpoints.allocations.detail(id)),

  /* -- attendance --------------------------------------------------------- */

  listMeetings: async (filters: { course?: number; semester?: number } = {}) => {
    const data = await get<Row[] | { results: Row[] }>(endpoints.attendance.meetings, {
      params: params({ ...filters }),
    });
    return unwrapList(data).map(toClassMeeting);
  },

  createMeeting: async (input: MeetingInput): Promise<ClassMeeting> =>
    toClassMeeting(await post<Row>(endpoints.attendance.meetings, input)),

  updateMeeting: async (id: number, input: Partial<MeetingInput>): Promise<ClassMeeting> =>
    toClassMeeting(await patch<Row>(endpoints.attendance.meetingDetail(id), input)),

  deleteMeeting: (id: number) => del(endpoints.attendance.meetingDetail(id)),

  /** The class list for one meeting: every registered student, marked or not. */
  register: async (meetingId: number): Promise<Register> => {
    const data = await get<Row>(endpoints.attendance.register(meetingId));
    return {
      meeting: toClassMeeting((data.meeting ?? {}) as Row),
      registered: num(data.registered),
      marked: num(data.marked),
      rows: ((data.rows as Row[]) ?? []).map((row) => ({
        enrollment: toEnrollment((row.enrollment ?? {}) as Row),
        record: row.record ? toAttendanceRecord(row.record as Row) : null,
      })),
    };
  },

  takeRegister: async (meeting: number, entries: RegisterEntry[]) => {
    const data = await post<Row>(endpoints.attendance.takeRegister, {
      meeting,
      entries: entries.map((entry) => ({
        enrollment: entry.enrollment,
        status: fromAttendanceStatus(entry.status),
        note: entry.note ?? "",
      })),
    });
    return ((data.records as Row[]) ?? []).map(toAttendanceRecord);
  },

  attendanceSummary: async (
    course: number,
    semester?: number,
  ): Promise<AttendanceSummary> => {
    const data = await get<Row>(endpoints.attendance.courseSummary, {
      params: params({ course, semester }),
    });
    return {
      meetings_held: num(data.meetings_held),
      class_rate: num(data.class_rate),
      rows: ((data.rows as Row[]) ?? []).map((row) => ({
        enrollment: toEnrollment((row.enrollment ?? {}) as Row),
        present: num(row.present),
        absent: num(row.absent),
        excused: num(row.excused),
        marked: num(row.marked),
        counted: num(row.counted),
        rate: num(row.rate),
      })),
    };
  },

  myAttendance: async (semester?: number): Promise<MyAttendanceRow[]> => {
    const data = await get<Row>(endpoints.attendance.myAttendance, {
      params: params({ semester }),
    });
    return ((data.rows as Row[]) ?? []).map((row) => ({
      course: num(row.course),
      course_code: String(row.course_code ?? ""),
      course_title: String(row.course_title ?? ""),
      meetings_held: num(row.meetings_held),
      present: num(row.present),
      absent: num(row.absent),
      excused: num(row.excused),
      marked: num(row.marked),
      counted: num(row.counted),
      rate: num(row.rate),
    }));
  },

  /* -- quizzes ------------------------------------------------------------ */

  listQuizzes: async (filters: { course?: number; semester?: number } = {}) => {
    const data = await get<Row[] | { results: Row[] }>(endpoints.quizzes.list, {
      params: params({ ...filters }),
    });
    return unwrapList(data).map(toQuiz);
  },

  createQuiz: async (input: QuizInput): Promise<Quiz> =>
    toQuiz(await post<Row>(endpoints.quizzes.list, input)),

  updateQuiz: async (id: number, input: Partial<QuizInput>): Promise<Quiz> =>
    toQuiz(await patch<Row>(endpoints.quizzes.detail(id), input)),

  deleteQuiz: (id: number) => del(endpoints.quizzes.detail(id)),

  quizMarkSheet: async (quizId: number): Promise<QuizMarkSheet> => {
    const data = await get<Row>(endpoints.quizzes.markSheet(quizId));
    return {
      quiz: toQuiz((data.quiz ?? {}) as Row),
      registered: num(data.registered),
      scored: num(data.scored),
      rows: ((data.rows as Row[]) ?? []).map((row) => ({
        enrollment: toEnrollment((row.enrollment ?? {}) as Row),
        score: row.score ? toQuizScore(row.score as Row) : null,
      })),
    };
  },

  saveQuizScores: async (quiz: number, entries: QuizScoreEntry[]): Promise<QuizScore[]> => {
    const data = await post<Row>(endpoints.quizzes.bulkEntry, { quiz, entries });
    return ((data.scores as Row[]) ?? []).map(toQuizScore);
  },

  /* -- final marks -------------------------------------------------------- */

  /**
   * The class list for a course with marks so far. Each row may carry a
   * `suggestion` — quiz performance scaled to the CA maximum — which the
   * lecturer accepts or overrides; nothing is applied automatically.
   */
  markSheet: async (course: number, semester: number): Promise<MarkSheet> => {
    const data = await get<Row>(endpoints.grades.markSheet, {
      params: params({ course, semester }),
    });
    return {
      graded: num(data.graded),
      registered: num(data.registered),
      ca_maximum: num(data.ca_maximum),
      quizzes_published: num(data.quizzes_published),
      rows: ((data.rows as Row[]) ?? []).map((row) => ({
        enrollment: toEnrollment((row.enrollment ?? {}) as Row),
        result: row.result ? toGrade(row.result as Row) : null,
        suggestion: toCaSuggestion(row.suggestion),
      })),
    };
  },

  saveResults: async (entries: ResultEntry[]) => {
    const data = await post<Row>(endpoints.grades.bulkEntry, { entries });
    return ((data.results as Row[]) ?? []).map(toGrade);
  },
};
