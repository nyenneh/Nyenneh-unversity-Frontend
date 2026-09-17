import { GraduationCap, Save, Send } from "lucide-react";
import { useMemo, useState } from "react";

import { PageHeader } from "@/components/shared/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Field";
import { EmptyState, ErrorState, TableSkeleton } from "@/components/ui/States";
import { TableWrap, Td, Th, Tr } from "@/components/ui/Table";
import { useCourses } from "@/hooks/useAcademics";
import { useGrades, usePublishGrades, useSaveGradeScores } from "@/hooks/useGrades";
import { cn } from "@/lib/utils";
import { getErrorMessage } from "@/services/api";
import type { Grade } from "@/types";

// how the 100 marks are split. matches the server validators - anything
// outside these gets rejected on save.
const MAX_CA_SCORE = 40;
const MAX_EXAM_SCORE = 60;

// "" and 0 are different things while someone is typing
type Draft = { ca: string; exam: string };

const toDraft = (grade: Grade): Draft => ({
  ca: grade.ca_score?.toString() ?? "",
  exam: grade.exam_score?.toString() ?? "",
});

const parseScore = (value: string) => (value.trim() === "" ? null : Number(value));

function ScoreInput({
  value,
  max,
  label,
  onChange,
  disabled,
}: {
  value: string;
  max: number;
  label: string;
  onChange: (value: string) => void;
  disabled: boolean;
}) {
  const numeric = parseScore(value);
  const invalid = numeric !== null && (Number.isNaN(numeric) || numeric < 0 || numeric > max);

  return (
    <input
      type="number"
      inputMode="numeric"
      min={0}
      max={max}
      value={value}
      disabled={disabled}
      aria-label={label}
      aria-invalid={invalid}
      onChange={(event) => onChange(event.target.value)}
      className={cn(
        "w-20 rounded-lg border px-2 py-1.5 text-sm tabular-nums transition",
        "focus:ring-2 focus:ring-brand-100 disabled:bg-ink-50 disabled:text-ink-400",
        invalid ? "border-red-400 text-red-700" : "border-ink-200 focus:border-brand-500",
      )}
    />
  );
}

export default function GradesPage() {
  const courses = useCourses();
  const [courseId, setCourseId] = useState<number | "">("");

  const { data, isPending, isError, error, refetch } = useGrades({
    course: courseId || undefined,
  });

  const saveScores = useSaveGradeScores();
  const publish = usePublishGrades();

  const [drafts, setDrafts] = useState<Record<number, Draft>>({});
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [savingId, setSavingId] = useState<number | null>(null);

  const grades = useMemo(() => data ?? [], [data]);

  // reseed the cells when a new gradebook arrives. doing it during render
  // rather than in an effect avoids a pass where the inputs still show the
  // last course's scores.
  const [seededFrom, setSeededFrom] = useState<typeof grades | null>(null);
  if (seededFrom !== grades) {
    setSeededFrom(grades);
    setDrafts(Object.fromEntries(grades.map((grade) => [grade.id, toDraft(grade)])));
    setSelected(new Set());
  }

  const isDirty = (grade: Grade) => {
    const draft = drafts[grade.id];
    if (!draft) return false;
    return (
      parseScore(draft.ca) !== grade.ca_score || parseScore(draft.exam) !== grade.exam_score
    );
  };

  const isValid = (draft: Draft) => {
    const ca = parseScore(draft.ca);
    const exam = parseScore(draft.exam);
    const okCa = ca === null || (!Number.isNaN(ca) && ca >= 0 && ca <= MAX_CA_SCORE);
    const okExam =
      exam === null || (!Number.isNaN(exam) && exam >= 0 && exam <= MAX_EXAM_SCORE);
    return okCa && okExam;
  };

  const saveRow = (grade: Grade) => {
    const draft = drafts[grade.id];
    if (!draft || !isValid(draft)) return;
    setSavingId(grade.id);
    saveScores.mutate(
      { id: grade.id, ca_score: parseScore(draft.ca), exam_score: parseScore(draft.exam) },
      { onSettled: () => setSavingId(null) },
    );
  };

  const publishable = grades.filter(
    (grade) => grade.total_score !== null && !grade.is_published && !isDirty(grade),
  );

  const toggle = (id: number) =>
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const allPublishableSelected =
    publishable.length > 0 && publishable.every((grade) => selected.has(grade.id));

  return (
    <>
      <PageHeader
        title="Grade control"
        description="CA is out of 40 and the exam out of 60. Results stay hidden from students until you publish them."
        actions={
          <Button
            icon={<Send className="size-4" />}
            disabled={selected.size === 0}
            loading={publish.isPending}
            onClick={() => publish.mutate([...selected])}
          >
            Publish {selected.size > 0 ? `(${selected.size})` : "results"}
          </Button>
        }
      />

      <Card className="mb-4 p-4">
        <Select
          label="Course"
          wrapperClassName="max-w-sm"
          value={courseId}
          onChange={(event) => setCourseId(event.target.value ? Number(event.target.value) : "")}
        >
          <option value="">Every course</option>
          {(courses.data ?? []).map((course) => (
            <option key={course.id} value={course.id}>
              {course.code} — {course.title}
            </option>
          ))}
        </Select>
      </Card>

      <Card>
        {isError ? (
          <ErrorState message={getErrorMessage(error)} onRetry={() => void refetch()} />
        ) : (
          <TableWrap>
            <thead>
              <tr>
                <Th className="w-10">
                  <input
                    type="checkbox"
                    aria-label="Select every publishable result"
                    className="size-4 rounded border-ink-300 text-brand-600 focus:ring-brand-200"
                    checked={allPublishableSelected}
                    disabled={publishable.length === 0}
                    onChange={(event) =>
                      setSelected(
                        event.target.checked
                          ? new Set(publishable.map((grade) => grade.id))
                          : new Set(),
                      )
                    }
                  />
                </Th>
                <Th>Student</Th>
                <Th>Course</Th>
                <Th align="center">CA / 40</Th>
                <Th align="center">Exam / 60</Th>
                <Th align="center">Total</Th>
                <Th align="center">Grade</Th>
                <Th align="right">Actions</Th>
              </tr>
            </thead>

            {isPending ? (
              <TableSkeleton cols={8} />
            ) : (
              <tbody>
                {grades.length === 0 ? (
                  <tr>
                    <Td colSpan={8}>
                      <EmptyState
                        title="Nothing to mark"
                        description="Rows appear here for every live course registration. Pick a course above to mark its class list."
                        icon={<GraduationCap className="size-5" />}
                      />
                    </Td>
                  </tr>
                ) : (
                  grades.map((grade) => {
                    const draft = drafts[grade.id] ?? toDraft(grade);
                    const dirty = isDirty(grade);
                    const canPublish =
                      grade.total_score !== null && !grade.is_published && !dirty;

                    return (
                      <Tr key={grade.id}>
                        <Td>
                          <input
                            type="checkbox"
                            aria-label={`Select ${grade.student_name} for ${grade.course_code}`}
                            className="size-4 rounded border-ink-300 text-brand-600 focus:ring-brand-200"
                            checked={selected.has(grade.id)}
                            disabled={!canPublish}
                            onChange={() => toggle(grade.id)}
                          />
                        </Td>
                        <Td>
                          <p className="font-medium text-ink-900">{grade.student_name}</p>
                          <p className="font-mono text-xs text-ink-500">
                            {grade.roll_number}
                          </p>
                        </Td>
                        <Td>
                          <p className="font-medium text-ink-900">{grade.course_code}</p>
                          <p className="text-xs text-ink-500">{grade.credit_units} units</p>
                        </Td>
                        <Td align="center">
                          <ScoreInput
                            label={`CA score for ${grade.student_name}`}
                            value={draft.ca}
                            max={MAX_CA_SCORE}
                            disabled={grade.is_published}
                            onChange={(value) =>
                              setDrafts((current) => ({
                                ...current,
                                [grade.id]: { ...draft, ca: value },
                              }))
                            }
                          />
                        </Td>
                        <Td align="center">
                          <ScoreInput
                            label={`Exam score for ${grade.student_name}`}
                            value={draft.exam}
                            max={MAX_EXAM_SCORE}
                            disabled={grade.is_published}
                            onChange={(value) =>
                              setDrafts((current) => ({
                                ...current,
                                [grade.id]: { ...draft, exam: value },
                              }))
                            }
                          />
                        </Td>
                        <Td align="center" className="font-semibold tabular-nums">
                          {grade.total_score ?? "—"}
                        </Td>
                        <Td align="center">
                          {grade.letter_grade ? (
                            <Badge
                              tone={
                                grade.letter_grade === "F"
                                  ? "danger"
                                  : grade.letter_grade === "A"
                                    ? "success"
                                    : "info"
                              }
                            >
                              {grade.letter_grade}
                            </Badge>
                          ) : (
                            <span className="text-ink-400">—</span>
                          )}
                        </Td>
                        <Td align="right">
                          {grade.is_published ? (
                            <Badge tone="success">Published</Badge>
                          ) : (
                            <Button
                              size="sm"
                              variant={dirty ? "primary" : "outline"}
                              icon={<Save className="size-3.5" />}
                              disabled={!dirty || !isValid(draft)}
                              loading={savingId === grade.id}
                              onClick={() => saveRow(grade)}
                            >
                              Save
                            </Button>
                          )}
                        </Td>
                      </Tr>
                    );
                  })
                )}
              </tbody>
            )}
          </TableWrap>
        )}
      </Card>
    </>
  );
}
