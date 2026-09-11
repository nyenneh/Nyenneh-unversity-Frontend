import { GraduationCap, Printer } from "lucide-react";

import { PageHeader } from "@/components/shared/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/States";
import { TableWrap, Td, Th, Tr } from "@/components/ui/Table";
import { useMyResults } from "@/hooks/useGrades";
import { getErrorMessage } from "@/services/api";

const gradeTone = (letter: string | null) => {
  if (letter === "A") return "success" as const;
  if (letter === "F") return "danger" as const;
  return "info" as const;
};

export default function ResultsPage() {
  const { data, isPending, isError, error, refetch } = useMyResults();

  if (isError) {
    return <ErrorState message={getErrorMessage(error)} onRetry={() => void refetch()} />;
  }

  const summaries = data ?? [];
  const latestCgpa = summaries.at(-1)?.cgpa;

  return (
    <>
      <PageHeader
        title="My results"
        description="Only results the registry has published appear here."
        actions={
          summaries.length > 0 ? (
            <Button
              variant="outline"
              icon={<Printer className="size-4" />}
              onClick={() => window.print()}
            >
              Print statement
            </Button>
          ) : null
        }
      />

      {isPending ? (
        <Card>
          <LoadingState label="Fetching your results…" />
        </Card>
      ) : summaries.length === 0 ? (
        <Card>
          <EmptyState
            title="No published results yet"
            description="Your scores appear here once the registry publishes them for the semester."
            icon={<GraduationCap className="size-5" />}
          />
        </Card>
      ) : (
        <div className="space-y-6">
          {latestCgpa !== undefined ? (
            <Card className="bg-navy-950 p-6 text-white">
              <p className="text-sm text-navy-200">Cumulative grade point average</p>
              <p className="mt-1 text-4xl font-semibold tabular-nums text-brand-300">
                {latestCgpa.toFixed(2)}
                <span className="ml-2 text-lg font-normal text-navy-300">/ 5.00</span>
              </p>
            </Card>
          ) : null}

          {summaries.map((summary) => (
            <Card key={`${summary.session}-${summary.semester}`}>
              <CardHeader
                title={`${summary.session} · ${
                  summary.semester === "first" ? "First" : "Second"
                } semester`}
                description={`${summary.total_credit_units} credit units`}
                action={
                  <div className="rounded-lg bg-brand-50 px-3 py-1.5 text-sm">
                    <span className="text-brand-700">GPA</span>{" "}
                    <span className="font-semibold tabular-nums text-brand-900">
                      {summary.gpa.toFixed(2)}
                    </span>
                  </div>
                }
              />
              <TableWrap>
                <thead>
                  <tr>
                    <Th>Course</Th>
                    <Th align="center">Units</Th>
                    <Th align="center">CA</Th>
                    <Th align="center">Exam</Th>
                    <Th align="center">Total</Th>
                    <Th align="center">Grade</Th>
                    <Th align="center">Points</Th>
                  </tr>
                </thead>
                <tbody>
                  {summary.grades.map((grade) => (
                    <Tr key={grade.id}>
                      <Td>
                        <p className="font-medium text-ink-900">{grade.course_code}</p>
                        <p className="text-xs text-ink-500">{grade.course_title}</p>
                      </Td>
                      <Td align="center" className="tabular-nums">
                        {grade.credit_units}
                      </Td>
                      <Td align="center" className="tabular-nums">
                        {grade.ca_score ?? "—"}
                      </Td>
                      <Td align="center" className="tabular-nums">
                        {grade.exam_score ?? "—"}
                      </Td>
                      <Td align="center" className="font-semibold tabular-nums">
                        {grade.total_score ?? "—"}
                      </Td>
                      <Td align="center">
                        <Badge tone={gradeTone(grade.letter_grade)}>
                          {grade.letter_grade ?? "—"}
                        </Badge>
                      </Td>
                      <Td align="center" className="tabular-nums">
                        {grade.grade_point ?? "—"}
                      </Td>
                    </Tr>
                  ))}
                </tbody>
              </TableWrap>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
