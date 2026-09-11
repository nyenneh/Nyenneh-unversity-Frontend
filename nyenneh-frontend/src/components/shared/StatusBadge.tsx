import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { titleCase } from "@/lib/utils";
import type { EnrollmentStatus, InvoiceStatus, StudentStatus } from "@/types";

/** One place mapping every domain status to a colour, so tones never drift. */
const tones: Record<string, BadgeTone> = {
  // enrollment ("pending" is shared with an unpaid invoice, and reads the same)
  registered: "success",
  rejected: "danger",
  dropped: "neutral",
  // student
  active: "success",
  suspended: "danger",
  graduated: "info",
  deferred: "warning",
  withdrawn: "neutral",
  // invoice ("pending" is shared with an unconfirmed payment)
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
