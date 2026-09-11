import { zodResolver } from "@hookform/resolvers/zod";
import { Banknote, Plus, Receipt, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input, Select } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { EmptyState, ErrorState, TableSkeleton } from "@/components/ui/States";
import { TableWrap, Td, Th, Tr } from "@/components/ui/Table";
import { useSessions } from "@/hooks/useAcademics";
import { useCreateInvoice, useInvoices, useRecordPayment } from "@/hooks/useFinance";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useStudents } from "@/hooks/useStudents";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import { getErrorMessage } from "@/services/api";
import type { Invoice, InvoiceStatus } from "@/types";

const STATUSES: InvoiceStatus[] = ["pending", "partial", "paid", "overdue", "cancelled"];

const STATUS_LABELS: Record<InvoiceStatus, string> = {
  pending: "Unpaid",
  partial: "Part paid",
  paid: "Paid",
  overdue: "Overdue",
  cancelled: "Cancelled",
};

/**
 * An invoice is not typed in line by line: the server bills the session's fee
 * structure for the student's programme and level, so issuing one names who and
 * when, never how much.
 */
const invoiceSchema = z.object({
  student: z.coerce.number().int().min(1, "Choose a student"),
  session: z.coerce.number().int().min(1, "Choose a session"),
  due_date: z.string(),
});

const paymentSchema = z.object({
  amount: z.coerce.number().positive("Enter an amount greater than zero"),
  method: z.enum(["bank_transfer", "card", "cash", "ussd", "waiver"]),
  reference: z.string(),
});

type InvoiceForm = z.input<typeof invoiceSchema>;
type PaymentForm = z.input<typeof paymentSchema>;

export default function FinancePage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<InvoiceStatus | "">("");
  const debouncedSearch = useDebouncedValue(search);

  const { data, isPending, isError, error, refetch, isFetching } = useInvoices({
    search: debouncedSearch || undefined,
    status: status || undefined,
  });
  const students = useStudents();
  const sessions = useSessions();

  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const [payingFor, setPayingFor] = useState<Invoice | null>(null);

  const createInvoice = useCreateInvoice();
  const recordPayment = useRecordPayment();

  const invoiceForm = useForm<InvoiceForm>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: { student: 0, session: 0, due_date: "" },
  });

  const paymentForm = useForm<PaymentForm>({
    resolver: zodResolver(paymentSchema),
    defaultValues: { amount: 0, method: "bank_transfer", reference: "" },
  });

  useEffect(() => {
    if (!payingFor) return;
    // Default to clearing the whole balance — the common case at the bursary.
    paymentForm.reset({
      amount: payingFor.balance,
      method: "bank_transfer",
      reference: "",
    });
  }, [payingFor, paymentForm]);

  const invoices = data ?? [];
  const billed = invoices.reduce((sum, invoice) => sum + invoice.amount, 0);
  const collected = invoices.reduce((sum, invoice) => sum + invoice.amount_paid, 0);
  const outstanding = invoices.reduce((sum, invoice) => sum + invoice.balance, 0);

  const submitInvoice = invoiceForm.handleSubmit((values) => {
    const parsed = invoiceSchema.parse(values);
    createInvoice.mutate(
      {
        session: parsed.session,
        students: [parsed.student],
        due_date: parsed.due_date || null,
      },
      {
        onSuccess: () => {
          setInvoiceOpen(false);
          invoiceForm.reset();
        },
      },
    );
  });

  const submitPayment = paymentForm.handleSubmit((values) => {
    if (!payingFor) return;
    const parsed = paymentSchema.parse(values);
    recordPayment.mutate(
      { invoice: payingFor.id, ...parsed },
      { onSuccess: () => setPayingFor(null) },
    );
  });

  return (
    <>
      <PageHeader
        title="Finance"
        description="Tuition invoices and the payments recorded against them."
        actions={
          <Button icon={<Plus className="size-4" />} onClick={() => setInvoiceOpen(true)}>
            Issue invoice
          </Button>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Billed" value={formatCurrency(billed)} icon={Receipt} tone="ink" />
        <StatCard
          label="Collected"
          value={formatCurrency(collected)}
          icon={Banknote}
          tone="emerald"
        />
        <StatCard
          label="Outstanding"
          value={formatCurrency(outstanding)}
          icon={Receipt}
          tone={outstanding > 0 ? "red" : "emerald"}
        />
      </div>

      <Card className="mb-4 p-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Student, roll number or reference"
              aria-label="Search invoices"
              className="w-full rounded-lg border border-ink-200 bg-white py-2 pl-9 pr-3 text-sm placeholder:text-ink-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            />
          </div>
          <Select
            aria-label="Filter by status"
            value={status}
            onChange={(event) => setStatus(event.target.value as InvoiceStatus | "")}
          >
            <option value="">Any status</option>
            {STATUSES.map((value) => (
              <option key={value} value={value}>
                {STATUS_LABELS[value]}
              </option>
            ))}
          </Select>
        </div>
      </Card>

      <Card className={cn(isFetching && !isPending && "opacity-70 transition-opacity")}>
        {isError ? (
          <ErrorState message={getErrorMessage(error)} onRetry={() => void refetch()} />
        ) : (
          <TableWrap>
            <thead>
              <tr>
                <Th>Reference</Th>
                <Th>Student</Th>
                <Th>Description</Th>
                <Th align="right">Amount</Th>
                <Th align="right">Balance</Th>
                <Th>Due</Th>
                <Th>Status</Th>
                <Th align="right">Actions</Th>
              </tr>
            </thead>

            {isPending ? (
              <TableSkeleton cols={8} />
            ) : (
              <tbody>
                {invoices.length === 0 ? (
                  <tr>
                    <Td colSpan={8}>
                      <EmptyState
                        title="No invoices"
                        description="Issue an invoice to start billing a student."
                        icon={<Receipt className="size-5" />}
                      />
                    </Td>
                  </tr>
                ) : (
                  invoices.map((invoice) => (
                    <Tr key={invoice.id}>
                      <Td className="font-mono text-xs">{invoice.reference}</Td>
                      <Td>
                        <p className="font-medium text-ink-900">{invoice.student_name}</p>
                        <p className="font-mono text-xs text-ink-500">
                          {invoice.roll_number}
                        </p>
                      </Td>
                      <Td className="max-w-48 truncate">{invoice.description}</Td>
                      <Td align="right" className="tabular-nums">
                        {formatCurrency(invoice.amount)}
                      </Td>
                      <Td
                        align="right"
                        className={cn(
                          "font-semibold tabular-nums",
                          invoice.balance > 0 ? "text-red-700" : "text-emerald-700",
                        )}
                      >
                        {formatCurrency(invoice.balance)}
                      </Td>
                      <Td className="text-xs">{formatDate(invoice.due_date)}</Td>
                      <Td>
                        <StatusBadge status={invoice.status} />
                      </Td>
                      <Td align="right">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={invoice.balance <= 0}
                          onClick={() => setPayingFor(invoice)}
                        >
                          Record payment
                        </Button>
                      </Td>
                    </Tr>
                  ))
                )}
              </tbody>
            )}
          </TableWrap>
        )}
      </Card>

      <Modal
        open={invoiceOpen}
        onClose={() => setInvoiceOpen(false)}
        title="Issue an invoice"
        description="Bills the session's fee structure to the student. They see it immediately under Tuition & Fees."
        footer={
          <>
            <Button variant="outline" onClick={() => setInvoiceOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submitInvoice} loading={createInvoice.isPending}>
              Issue invoice
            </Button>
          </>
        }
      >
        <form className="space-y-4" onSubmit={submitInvoice}>
          <Select
            label="Student"
            error={invoiceForm.formState.errors.student?.message}
            {...invoiceForm.register("student")}
          >
            <option value={0} disabled>
              Choose a student
            </option>
            {(students.data ?? []).map((student) => (
              <option key={student.id} value={student.id}>
                {student.full_name} — {student.roll_number}
              </option>
            ))}
          </Select>

          <Select
            label="Session"
            error={invoiceForm.formState.errors.session?.message}
            {...invoiceForm.register("session")}
          >
            <option value={0} disabled>
              Choose a session
            </option>
            {(sessions.data ?? []).map((session) => (
              <option key={session.id} value={session.id}>
                {session.name}
                {session.is_current ? " (current)" : ""}
              </option>
            ))}
          </Select>

          <Input
            label="Due date"
            type="date"
            hint="Optional — leave blank for no deadline"
            error={invoiceForm.formState.errors.due_date?.message}
            {...invoiceForm.register("due_date")}
          />

          <p className="rounded-lg bg-ink-50 p-3 text-xs text-ink-600">
            The amount comes from the fee structure set for the student's
            programme and level in that session. If no structure covers them,
            nothing is billed and the invoice is reported as failed.
          </p>
        </form>
      </Modal>

      <Modal
        open={payingFor !== null}
        onClose={() => setPayingFor(null)}
        title="Record a payment"
        description={
          payingFor
            ? `${payingFor.student_name} · ${formatCurrency(payingFor.balance)} outstanding on ${payingFor.reference}`
            : undefined
        }
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setPayingFor(null)}>
              Cancel
            </Button>
            <Button onClick={submitPayment} loading={recordPayment.isPending}>
              Record payment
            </Button>
          </>
        }
      >
        <form className="space-y-4" onSubmit={submitPayment}>
          <Input
            label="Amount"
            type="number"
            min={0}
            step="0.01"
            error={paymentForm.formState.errors.amount?.message}
            {...paymentForm.register("amount")}
          />
          <Select
            label="Method"
            error={paymentForm.formState.errors.method?.message}
            {...paymentForm.register("method")}
          >
            <option value="bank_transfer">Bank transfer</option>
            <option value="card">Card</option>
            <option value="cash">Cash</option>
            <option value="ussd">USSD</option>
            <option value="waiver">Waiver or scholarship</option>
          </Select>
          <Input
            label="Teller / transaction reference"
            placeholder="TRF-88213"
            hint="Optional — generated if left blank"
            error={paymentForm.formState.errors.reference?.message}
            {...paymentForm.register("reference")}
          />
        </form>
      </Modal>
    </>
  );
}
