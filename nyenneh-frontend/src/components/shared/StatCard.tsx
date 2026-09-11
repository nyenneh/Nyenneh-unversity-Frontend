import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

const tones = {
  brand: "bg-brand-50 text-brand-600",
  emerald: "bg-emerald-50 text-emerald-600",
  amber: "bg-amber-50 text-amber-600",
  red: "bg-red-50 text-red-600",
  ink: "bg-ink-100 text-ink-600",
} as const;

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "brand",
  loading = false,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon: LucideIcon;
  tone?: keyof typeof tones;
  loading?: boolean;
}) {
  return (
    <div className="rounded-xl border border-ink-200/70 bg-white p-5 shadow-sm shadow-ink-950/[0.03]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-ink-500">{label}</p>
          {loading ? (
            <div className="mt-2 h-7 w-24 animate-pulse rounded bg-ink-100" />
          ) : (
            <p className="mt-1 truncate text-2xl font-semibold tracking-tight text-ink-900">
              {value}
            </p>
          )}
          {hint && !loading ? <p className="mt-1 text-xs text-ink-500">{hint}</p> : null}
        </div>
        <span className={cn("shrink-0 rounded-lg p-2.5", tones[tone])}>
          <Icon className="size-5" />
        </span>
      </div>
    </div>
  );
}
