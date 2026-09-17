import { FileQuestion, Plus, Save } from "lucide-react";
import { useMemo, useState } from "react";

import { PageHeader } from "@/components/shared/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input, Select, Textarea } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/States";
import { TableWrap, Td, Th, Tr } from "@/components/ui/Table";
import {
  useAllocations,
  useQuizMarkSheet,
  useQuizzes,
  useSaveQuiz,
  useSaveQuizScores,
} from "@/hooks/useLecturer";
import { cn } from "@/lib/utils";
import { getErrorMessage } from "@/services/api";

const parseScore = (value: string) => (value.trim() === "" ? null : Number(value));

export default function QuizzesPage() {
  const allocations = useAllocations({ is_active: true });
  const [allocationId, setAllocationId] = useState<number | "">("");

  const allocation = (allocations.data ?? []).find((row) => row.id === allocationId);
  const courseId = allocation?.course;
  const semesterId = allocation?.semester;

  const quizzes = useQuizzes(courseId ? { course: courseId, semester: semesterId } : {});
  const [quizId, setQuizId] = useState<number | null>(null);
  const markSheet = useQuizMarkSheet(quizId);

  const saveQuiz = useSaveQuiz();
  const saveScores = useSaveQuizScores();

  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    max_score: "10",
    held_on: "",
    is_published: true,
  });

  // scores being typed. "" means not marked yet, which is not the same as 0.
  const [drafts, setDrafts] = useState<Record<number, string>>({});
  const rows = useMemo(() => markSheet.data?.rows ?? [], [markSheet.data]);
  const maxScore = markSheet.data?.quiz.max_score ?? 0;

  const [seededFrom, setSeededFrom] = useState<typeof rows | null>(null);
  if (seededFrom !== rows) {
    setSeededFrom(rows);
    setDrafts(
      Object.fromEntries(
        rows.map((row) => [row.enrollment.id, row.score?.score?.toString() ?? ""]),
      ),
    );
  }

  const invalid = (value: string) => {
    const score = parseScore(value);
    return score !== null && (Number.isNaN(score) || score < 0 || score > maxScore);
  };

  const entries = rows
    .map((row) => ({ enrollment: row.enrollment.id, value: drafts[row.enrollment.id] ?? "" }))
    .filter((entry) => entry.value.trim() !== "" && !invalid(entry.value))
    .map((entry) => ({ enrollment: entry.enrollment, score: Number(entry.value) }));

  const anyInvalid = rows.some((row) => invalid(drafts[row.enrollment.id] ?? ""));

  return (
    <>
      <PageHeader
        title="Quizzes"
        description="Continuous assessment you set. Scores roll up into a suggested CA mark on your mark sheet."
        actions={
          <Button
            icon={<Plus className="size-4" />}
            disabled={!courseId}
            onClick={() => setCreating(true)}
          >
            New quiz
          </Button>
        }
      />

      <Card className="mb-4 grid gap-4 p-4 sm:grid-cols-2">
        <Select
          label="Course"
          value={allocationId}
          onChange={(event) => {
            setAllocationId(event.target.value ? Number(event.target.value) : "");
            setQuizId(null);
          }}
        >
          <option value="">Choose a course…</option>
          {(allocations.data ?? []).map((row) => (
            <option key={row.id} value={row.id}>
              {row.course_code} — {row.course_title}
            </option>
          ))}
        </Select>

        <Select
          label="Quiz"
          value={quizId ?? ""}
          disabled={!courseId}
          onChange={(event) =>
            setQuizId(event.target.value ? Number(event.target.value) : null)
          }
        >
          <option value="">Choose a quiz…</option>
          {(quizzes.data ?? []).map((quiz) => (
            <option key={quiz.id} value={quiz.id}>
              {quiz.title} (out of {quiz.max_score}) — {quiz.scored_count} marked
            </option>
          ))}
        </Select>
      </Card>

      {courseId && quizId === null ? (
        <Card>
          {quizzes.isError ? (
            <ErrorState
              message={getErrorMessage(quizzes.error)}
              onRetry={() => void quizzes.refetch()}
            />
          ) : (quizzes.data ?? []).length === 0 ? (
            <EmptyState
              title="No quizzes yet"
              description="Set one and it becomes part of this course's continuous assessment."
              icon={<FileQuestion className="size-5" />}
            />
          ) : (
            <TableWrap>
              <thead>
                <tr>
                  <Th>Quiz</Th>
                  <Th align="center">Out of</Th>
                  <Th align="center">Held</Th>
                  <Th align="center">Marked</Th>
                  <Th align="center">Visible</Th>
                </tr>
              </thead>
              <tbody>
                {(quizzes.data ?? []).map((quiz) => (
                  <Tr key={quiz.id}>
                    <Td>
                      <button
                        type="button"
                        onClick={() => setQuizId(quiz.id)}
                        className="font-medium text-ink-900 hover:text-brand-600"
                      >
                        {quiz.title}
                      </button>
                      {quiz.description ? (
                        <p className="text-xs text-ink-500">{quiz.description}</p>
                      ) : null}
                    </Td>
                    <Td align="center" className="tabular-nums">
                      {quiz.max_score}
                    </Td>
                    <Td align="center">{quiz.held_on ?? "—"}</Td>
                    <Td align="center" className="tabular-nums">
                      {quiz.scored_count}
                    </Td>
                    <Td align="center">
                      <Badge tone={quiz.is_published ? "success" : "neutral"}>
                        {quiz.is_published ? "Students" : "Hidden"}
                      </Badge>
                    </Td>
                  </Tr>
                ))}
              </tbody>
            </TableWrap>
          )}
        </Card>
      ) : null}

      {quizId !== null ? (
        <Card>
          <div className="flex flex-wrap items-center gap-3 border-b border-ink-100 p-4">
            <div className="mr-auto">
              <p className="font-medium text-ink-900">{markSheet.data?.quiz.title}</p>
              <p className="text-sm text-ink-500">
                Marked out of {maxScore} · {markSheet.data?.scored ?? 0} of{" "}
                {markSheet.data?.registered ?? 0} scored
              </p>
            </div>
            <Button
              icon={<Save className="size-4" />}
              loading={saveScores.isPending}
              disabled={entries.length === 0 || anyInvalid}
              onClick={() => saveScores.mutate({ quiz: quizId, entries })}
            >
              Save {entries.length > 0 ? `(${entries.length})` : "scores"}
            </Button>
          </div>

          {markSheet.isError ? (
            <ErrorState
              message={getErrorMessage(markSheet.error)}
              onRetry={() => void markSheet.refetch()}
            />
          ) : markSheet.isPending ? (
            <LoadingState label="Loading the class list…" />
          ) : rows.length === 0 ? (
            <EmptyState title="Nobody registered on this course yet" />
          ) : (
            <TableWrap>
              <thead>
                <tr>
                  <Th>Student</Th>
                  <Th align="center">Score</Th>
                  <Th align="center">Percentage</Th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const value = drafts[row.enrollment.id] ?? "";
                  const score = parseScore(value);
                  const bad = invalid(value);
                  return (
                    <Tr key={row.enrollment.id}>
                      <Td>
                        <p className="font-medium text-ink-900">
                          {row.enrollment.student_name}
                        </p>
                        <p className="font-mono text-xs text-ink-500">
                          {row.enrollment.roll_number}
                        </p>
                      </Td>
                      <Td align="center">
                        <input
                          type="number"
                          inputMode="decimal"
                          min={0}
                          max={maxScore}
                          step="0.01"
                          value={value}
                          aria-label={`Score for ${row.enrollment.student_name}`}
                          aria-invalid={bad}
                          onChange={(event) =>
                            setDrafts((state) => ({
                              ...state,
                              [row.enrollment.id]: event.target.value,
                            }))
                          }
                          className={cn(
                            "w-24 rounded-lg border px-2 py-1.5 text-sm tabular-nums transition",
                            "focus:ring-2 focus:ring-brand-100",
                            bad
                              ? "border-red-400 text-red-700"
                              : "border-ink-200 focus:border-brand-500",
                          )}
                        />
                        <span className="ml-1 text-xs text-ink-400">/ {maxScore}</span>
                      </Td>
                      <Td align="center" className="tabular-nums text-ink-600">
                        {score === null || bad || maxScore === 0
                          ? "—"
                          : `${Math.round((score / maxScore) * 1000) / 10}%`}
                      </Td>
                    </Tr>
                  );
                })}
              </tbody>
            </TableWrap>
          )}
        </Card>
      ) : null}

      <Modal open={creating} onClose={() => setCreating(false)} title="New quiz">
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            if (!courseId || !semesterId) return;
            saveQuiz.mutate(
              {
                course: courseId,
                semester: semesterId,
                title: form.title,
                description: form.description,
                max_score: Number(form.max_score),
                held_on: form.held_on || null,
                is_published: form.is_published,
              },
              {
                onSuccess: (quiz) => {
                  setCreating(false);
                  setForm({
                    title: "",
                    description: "",
                    max_score: "10",
                    held_on: "",
                    is_published: true,
                  });
                  setQuizId(quiz.id);
                },
              },
            );
          }}
        >
          <Input
            label="Title"
            required
            placeholder="e.g. Class Test 1"
            value={form.title}
            onChange={(event) => setForm({ ...form, title: event.target.value })}
          />
          <Textarea
            label="Description"
            rows={2}
            value={form.description}
            onChange={(event) => setForm({ ...form, description: event.target.value })}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Marked out of"
              type="number"
              min={1}
              step="0.01"
              required
              hint="Not the CA total — a test out of 30 counts for more than one out of 5."
              value={form.max_score}
              onChange={(event) => setForm({ ...form, max_score: event.target.value })}
            />
            <Input
              label="Date held"
              type="date"
              value={form.held_on}
              onChange={(event) => setForm({ ...form, held_on: event.target.value })}
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-ink-700">
            <input
              type="checkbox"
              className="size-4 rounded border-ink-300 text-brand-600 focus:ring-brand-200"
              checked={form.is_published}
              onChange={(event) =>
                setForm({ ...form, is_published: event.target.checked })
              }
            />
            Let students see this quiz and their score
          </label>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setCreating(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={saveQuiz.isPending}>
              Create quiz
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
