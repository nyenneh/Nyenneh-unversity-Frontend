import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { titleCase } from "@/lib/utils";
import type { EnrollmentStatus, InvoiceStatus, StudentStatus } from "@/types";

// every status -> colour in one place so the tones don't drift apart
const tones: Record<string, BadgeTone> = {
  // enrollment ("pending" is shared with invoices below, reads the same either way)
  registered: "success",
  rejected: "danger",
  dropped: "neutral",
  // student
  active: "success",
  suspended: "danger",
  graduated: "info",
  deferred: "warning",
  withdrawn: "neutral",
  // invoice
  paid: "success",
  partial: "info",
  pending: "warning",
  overdue: "danger",
  cancelled: "neutral",
};

export function StatusBadge({
  status,
}: {
  status: EnrollmentStatus | StudentStatus | InvoiceStatus;
}) {
  return <Badge tone={tones[status] ?? "neutral"}>{titleCase(status)}</Badge>;
}
