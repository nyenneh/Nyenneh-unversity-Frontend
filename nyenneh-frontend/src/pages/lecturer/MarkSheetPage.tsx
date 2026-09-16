import { GraduationCap, Save, Wand2 } from "lucide-react";
import { useMemo, useState } from "react";

import { PageHeader } from "@/components/shared/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Field";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/States";
import { TableWrap, Td, Th, Tr } from "@/components/ui/Table";
import { useAllocations, useMarkSheet, useSaveResults } from "@/hooks/useLecturer";
import { cn } from "@/lib/utils";
import { getErrorMessage } from "@/services/api";

const MAX_EXAM_SCORE = 60;

type Draft = { ca: string; exam: string };

const parseScore = (value: string) => (value.trim() === "" ? null : Number(value));

function ScoreInput({
  value,
  max,
  label,
  disabled,
  onChange,
}: {
  value: string;
  max: number;
  label: string;
  disabled: boolean;
  onChange: (value: string) => void;
}) {
  const score = parseScore(value);
  const invalid = score !== null && (Number.isNaN(score) || score < 0 || score > max);
  return (
    <input
      type="number"
      inputMode="decimal"
      min={0}
      max={max}
      step="0.01"
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

export default function MarkSheetPage() {
  const allocations = useAllocations({ is_active: true });
  const [allocationId, setAllocationId] = useState<number | "">("");

  const allocation = (allocations.data ?? []).find((row) => row.id === allocationId);
  const { data, isPending, isError, error, refetch } = useMarkSheet(
    allocation?.course ?? null,
    allocation?.semester ?? null,
  );
  const saveResults = useSaveResults();

  const rows = useMemo(() => data?.rows ?? [], [data]);
  const caMaximum = data?.ca_maximum ?? 40;

  const [drafts, setDrafts] = useState<Record<number, Draft>>({});
  const [seededFrom, setSeededFrom] = useState<typeof rows | null>(null);
  if (seededFrom !== rows) {
    setSeededFrom(rows);
    setDrafts(
      Object.fromEntries(
        rows.map((row) => [
          row.enrollment.id,
          {
            ca: row.result?.ca_score?.toString() ?? "",
            exam: row.result?.exam_score?.toString() ?? "",
          },
        ]),
      ),
    );
  }

  const valid = (draft: Draft) => {
    const ca = parseScore(draft.ca);
    const exam = parseScore(draft.exam);
    const okCa = ca !== null && !Number.isNaN(ca) && ca >= 0 && ca <= caMaximum;
    const okExam =
      exam !== null && !Number.isNaN(exam) && exam >= 0 && exam <= MAX_EXAM_SCORE;
    return okCa && okExam;
  };

  /** Fills every empty CA cell from the quiz suggestion; typed values stand. */
  const applySuggestions = () =>
    setDrafts((state) => {
      const next = { ...state };
      for (const row of rows) {
        const draft = next[row.enrollment.id];
        if (row.suggestion && draft && draft.ca.trim() === "") {
          next[row.enrollment.id] = {
            ...draft,
            ca: String(row.suggestion.suggested_ca),
          };
        }
      }
      return next;
    });

  const entries = rows
    .filter((row) => {
      const draft = drafts[row.enrollment.id];
      return draft && valid(draft) && !row.result?.is_published;
    })
    .map((row) => {
      const draft = drafts[row.enrollment.id];
      return {
        enrollment: row.enrollment.id,
        ca_score: Number(draft.ca),
        exam_score: Number(draft.exam),
      };
    });

  const suggestable = rows.filter(
    (row) => row.suggestion && (drafts[row.enrollment.id]?.ca ?? "").trim() === "",
  ).length;

  return (
    <>
      <PageHeader
        title="Mark sheet"
        description={`CA is out of ${caMaximum} and the exam out of ${MAX_EXAM_SCORE}. An administrator publishes results once you are done.`}
        actions={
          <div className="flex gap-2">
            <Button
              variant="outline"
              icon={<Wand2 className="size-4" />}
              disabled={suggestable === 0}
              onClick={applySuggestions}
            >
              Use quiz CA {suggestable > 0 ? `(${suggestable})` : ""}
            </Button>
            <Button
              icon={<Save className="size-4" />}
              loading={saveResults.isPending}
              disabled={entries.length === 0}
              onClick={() => saveResults.mutate(entries)}
            >
              Save {entries.length > 0 ? `(${entries.length})` : "marks"}
            </Button>
          </div>
        }
      />

      <Card className="mb-4 p-4">
        <Select
          label="Course"
          wrapperClassName="max-w-md"
          value={allocationId}
          onChange={(event) =>
            setAllocationId(event.target.value ? Number(event.target.value) : "")
          }
        >
          <option value="">Choose a course…</option>
          {(allocations.data ?? []).map((row) => (
            <option key={row.id} value={row.id}>
              {row.course_code} — {row.course_title} ({row.student_count})
            </option>
          ))}
        </Select>
        {data ? (
          <p className="mt-3 text-sm text-ink-500">
            {data.graded} of {data.registered} marked · {data.quizzes_published} quiz
            {data.quizzes_published === 1 ? "" : "zes"} published
          </p>
        ) : null}
      </Card>

      <Card>
        {!allocation ? (
          <EmptyState
            title="Pick a course"
            description="Choose one of your allocated courses to mark its class list."
            icon={<GraduationCap className="size-5" />}
          />
        ) : isError ? (
          <ErrorState message={getErrorMessage(error)} onRetry={() => void refetch()} />
        ) : isPending ? (
          <LoadingState label="Loading the mark sheet…" />
        ) : rows.length === 0 ? (
          <EmptyState title="Nobody registered on this course yet" />
        ) : (
          <TableWrap>
            <thead>
              <tr>
                <Th>Student</Th>
                <Th align="center">Quiz CA</Th>
                <Th align="center">CA / {caMaximum}</Th>
                <Th align="center">Exam / {MAX_EXAM_SCORE}</Th>
                <Th align="center">Total</Th>
                <Th align="center">Grade</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const draft = drafts[row.enrollment.id] ?? { ca: "", exam: "" };
                const published = Boolean(row.result?.is_published);
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
                      {row.suggestion ? (
                        <button
                          type="button"
                          disabled={published}
                          onClick={() =>
                            setDrafts((state) => ({
                              ...state,
                              [row.enrollment.id]: {
                                ...draft,
                                ca: String(row.suggestion?.suggested_ca ?? ""),
                              },
                            }))
                          }
                          title={`${row.suggestion.quizzes_taken} quiz(zes), ${row.suggestion.percentage}%`}
                          className="rounded-md bg-brand-50 px-2 py-1 text-xs font-medium tabular-nums text-brand-700 transition hover:bg-brand-100 disabled:opacity-50"
                        >
                          {row.suggestion.suggested_ca}
                        </button>
                      ) : (
                        <span className="text-ink-400">—</span>
                      )}
                    </Td>
                    <Td align="center">
                      <ScoreInput
                        label={`CA score for ${row.enrollment.student_name}`}
                        value={draft.ca}
                        max={caMaximum}
                        disabled={published}
                        onChange={(value) =>
                          setDrafts((state) => ({
                            ...state,
                            [row.enrollment.id]: { ...draft, ca: value },
                          }))
                        }
                      />
                    </Td>
                    <Td align="center">
                      <ScoreInput
                        label={`Exam score for ${row.enrollment.student_name}`}
                        value={draft.exam}
                        max={MAX_EXAM_SCORE}
                        disabled={published}
                        onChange={(value) =>
                          setDrafts((state) => ({
                            ...state,
                            [row.enrollment.id]: { ...draft, exam: value },
                          }))
                        }
                      />
                    </Td>
                    <Td align="center" className="font-semibold tabular-nums">
                      {row.result?.total_score ?? "—"}
                    </Td>
                    <Td align="center">
                      {published ? (
                        <Badge tone="success">{row.result?.letter_grade}</Badge>
                      ) : row.result?.letter_grade ? (
                        <Badge
                          tone={row.result.letter_grade === "F" ? "danger" : "info"}
                        >
                          {row.result.letter_grade}
                        </Badge>
                      ) : (
                        <span className="text-ink-400">—</span>
                      )}
                    </Td>
                  </Tr>
                );
              })}
            </tbody>
          </TableWrap>
        )}
      </Card>
    </>
  );
}
