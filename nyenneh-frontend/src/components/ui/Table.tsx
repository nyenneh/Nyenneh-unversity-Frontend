import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/** Horizontal scroll lives on this wrapper so wide tables never widen the page. */
export function TableWrap({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("scrollbar-slim w-full overflow-x-auto", className)}>
      <table className="w-full min-w-[42rem] border-collapse text-sm">{children}</table>
    </div>
  );
}

export function Th({
  children,
  className,
  align = "left",
}: {
  children?: ReactNode;
  className?: string;
  align?: "left" | "right" | "center";
}) {
  return (
    <th
      scope="col"
      className={cn(
        "border-b border-ink-200 bg-ink-50/70 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-ink-500",
        align === "right" && "text-right",
        align === "center" && "text-center",
        align === "left" && "text-left",
        className,
      )}
    >
      {children}
    </th>
  );
}

export function Td({
  children,
  className,
  align = "left",
  colSpan,
}: {
  children?: ReactNode;
  className?: string;
  align?: "left" | "right" | "center";
  colSpan?: number;
}) {
  return (
    <td
      colSpan={colSpan}
      className={cn(
        "border-b border-ink-100 px-4 py-3 text-ink-700",
        align === "right" && "text-right",
        align === "center" && "text-center",
        className,
      )}
    >
      {children}
    </td>
  );
}

export function Tr({ children, className }: { children: ReactNode; className?: string }) {
  return <tr className={cn("transition hover:bg-ink-50/60", className)}>{children}</tr>;
}
