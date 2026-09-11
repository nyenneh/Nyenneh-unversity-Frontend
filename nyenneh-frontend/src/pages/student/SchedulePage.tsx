import { CalendarDays, MapPin, User } from "lucide-react";

import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardHeader } from "@/components/ui/Card";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/States";
import { useMySchedule } from "@/hooks/useAcademics";
import { formatTime, titleCase } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { getErrorMessage } from "@/services/api";
import type { Weekday } from "@/types";

const DAYS: Weekday[] = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

/** Monday is index 0 here; Sunday falls back to Monday's column. */
function todayName(): Weekday {
  return DAYS[Math.max(0, new Date().getDay() - 1)] ?? "monday";
}

export default function SchedulePage() {
  // Scoped to the signed-in student by the server, from their approved courses.
  const { data, isPending, isError, error, refetch } = useMySchedule();
  const today = todayName();

  if (isError) {
    return <ErrorState message={getErrorMessage(error)} onRetry={() => void refetch()} />;
  }

  const slots = data ?? [];
  const weeklyHours = slots.reduce((sum, slot) => sum + slot.duration_hours, 0);

  return (
    <>
      <PageHeader
        title="My schedule"
        description="Class times for every course the registry has approved for you."
        actions={
          <div className="rounded-lg border border-ink-200 bg-white px-4 py-2 text-sm">
            <span className="text-ink-500">Contact hours</span>{" "}
            <span className="font-semibold text-ink-900">{weeklyHours} / week</span>
          </div>
        }
      />

      {isPending ? (
        <Card>
          <LoadingState label="Building your timetable…" />
        </Card>
      ) : slots.length === 0 ? (
        <Card>
          <EmptyState
            title="Your timetable is empty"
            description="Once the registry approves your course registrations, their class times appear here."
            icon={<CalendarDays className="size-5" />}
          />
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {DAYS.map((day) => {
            const daySlots = slots
              .filter((slot) => slot.day === day)
              .sort((a, b) => a.start_time.localeCompare(b.start_time));
            const isToday = day === today;

            return (
              <Card
                key={day}
                className={cn("flex flex-col", isToday && "ring-2 ring-brand-500")}
              >
                <CardHeader
                  title={
                    <span className="flex items-center gap-2">
                      {titleCase(day)}
                      {isToday ? (
                        <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-700">
                          Today
                        </span>
                      ) : null}
                    </span>
                  }
                  description={`${daySlots.length} class${daySlots.length === 1 ? "" : "es"}`}
                />
                <div className="flex-1 space-y-2 p-3">
                  {daySlots.length === 0 ? (
                    <p className="px-2 py-6 text-center text-sm text-ink-400">Free day</p>
                  ) : (
                    daySlots.map((slot) => (
                      <div
                        key={slot.id}
                        className="rounded-lg border-l-4 border-brand-500 bg-ink-50 p-3"
                      >
                        <p className="text-sm font-semibold text-ink-900">{slot.course_code}</p>
                        <p className="truncate text-xs text-ink-600">{slot.course_title}</p>
                        <p className="mt-2 text-xs font-medium text-brand-700">
                          {formatTime(slot.start_time)} – {formatTime(slot.end_time)}
                        </p>
                        <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-xs text-ink-500">
                          <span className="flex items-center gap-1">
                            <MapPin className="size-3" />
                            {slot.venue}
                          </span>
                          <span className="flex items-center gap-1">
                            <User className="size-3" />
                            {slot.lecturer_name || "Unassigned"}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}
