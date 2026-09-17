import { get, patch, post, unwrapList } from "./api";
import { num, toEnrollment, toGrade, toSemester } from "./adapters";
import { endpoints } from "./endpoints";
import type { Enrollment, Grade, ResultSummary } from "@/types";

type Row = Record<string, unknown>;

export interface GradeFilters {
  course?: number | "";
  student?: number | "";
  session?: string;
  semester?: string;
}

export interface GradeScoreInput {
  ca_score: number | null;
  exam_score: number | null;
}

// null means nothing was entered, which counts as zero
const score = (value: number | null) => value ?? 0;

// A placeholder row for a student nobody has marked yet.
// The server only has a result once someone records one, but the lecturer
// needs the whole class list in front of them to mark it. So we fake the
// missing rows from the registration and give them a negative id (the
// enrollment id, negated) - keeps the React keys unique and lets updateScores
// tell "create this" apart from "update this".
function ungradedRow(enrollment: Enrollment): Grade {
  return {
    id: -enrollment.id,
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
  };
}

interface MyResultsResponse {
  results: Row[];
  summary: Row[];
}

export const gradesService = {
  // Every live registration with its result where there is one. Both are
  // fetched because a lecturer marks against the class list, and half of it
  // has no result row yet.
  list: async (filters: GradeFilters = {}): Promise<Grade[]> => {
    const [results, enrollments] = await Promise.all([
      get<Row[]>(endpoints.grades.list, { params: filters }).then(unwrapList),
      get<Row[]>(endpoints.enrollments.list, {
        params: { ...filters, status: "REGISTERED" },
      }).then(unwrapList),
    ]);

    const gradesByEnrollment = new Map<number, Grade>();
    for (const row of results) {
      const grade = toGrade(row);
      gradesByEnrollment.set(grade.enrollment, grade);
    }

    const rows = enrollments.map((row) => {
      const enrollment = toEnrollment(row);
      return gradesByEnrollment.get(enrollment.id) ?? ungradedRow(enrollment);
    });

    // a result whose registration was dropped afterwards still belongs here
    const seen = new Set(rows.map((row) => row.enrollment));
    for (const grade of gradesByEnrollment.values()) {
      if (!seen.has(grade.enrollment)) rows.push(grade);
    }
    return rows;
  },

  // creates the result the first time, updates it after that
  updateScores: async (id: number, payload: GradeScoreInput) => {
    const body = {
      ca_score: score(payload.ca_score),
      exam_score: score(payload.exam_score),
    };
    if (id < 0) {
      return toGrade(
        await post<Row>(endpoints.grades.list, { enrollment: -id, ...body }),
      );
    }
    return toGrade(await patch<Row>(endpoints.grades.detail(id), body));
  },

  publish: (ids: number[]) =>
    post<{ updated: number }>(endpoints.grades.publish, {
      // skip the fake rows, there is nothing to publish on an unmarked result
      results: ids.filter((id) => id > 0),
    }),

  // The server sends the published results and the per-semester GPA rows as
  // two lists. We show one card per semester, so join them on the semester id.
  myResults: async (): Promise<ResultSummary[]> => {
    const data = await get<MyResultsResponse>(endpoints.grades.myResults);

    const gradesBySemester = new Map<number, Grade[]>();
    for (const row of data.results ?? []) {
      const semesterId = Number(row.semester);
      const bucket = gradesBySemester.get(semesterId);
      if (bucket) bucket.push(toGrade(row));
      else gradesBySemester.set(semesterId, [toGrade(row)]);
    }

    return (data.summary ?? []).map((row) => ({
      session: String(row.session_name ?? ""),
      semester: toSemester(row.semester_number),
      gpa: num(row.gpa),
      cgpa: num(row.cgpa),
      total_credit_units: num(row.credit_units),
      grades: gradesBySemester.get(Number(row.semester)) ?? [],
    }));
  },
};
