import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle, CreditCard, Receipt, Zap } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Input, Select } from "@/components/ui/Field";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/States";
import { TableWrap, Td, Th, Tr } from "@/components/ui/Table";
import { useMyInvoices, usePayments, useSettleBalance } from "@/hooks/useFinance";
import { cn, formatCurrency, formatDate, formatDateTime, titleCase } from "@/lib/utils";
import { getErrorMessage } from "@/services/api";
import type { PaymentMethod } from "@/types";

/** Mirrors the payment methods the API accepts; "waiver" is bursary-only. */
const METHODS: { value: PaymentMethod; label: string }[] = [
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "card", label: "Debit / Credit Card" },
  { value: "ussd", label: "USSD" },
  { value: "cash", label: "Cash at the Bursary" },
];

const paySchema = z.object({
  amount: z.coerce.number().positive("Enter an amount greater than zero"),
  method: z.enum(["bank_transfer", "card", "ussd", "cash"]),
});

type PayForm = z.input<typeof paySchema>;

export default function FeesPage() {
  const { data, isPending, isError, error, refetch } = useMyInvoices();
  const settle = useSettleBalance();
  // Every payment on the account, so the history below is not per-invoice.
  const history = usePayments();

  const invoices = data ?? [];

  // The sketch bills per semester; the newest session/semester on the account is
  // the one being settled, and older terms stay in the history below.
  const current = invoices.length
    ? [...invoices].sort((a, b) =>
        `${b.session}${b.semester}`.localeCompare(`${a.session}${a.semester}`),
      )[0]
    : null;

  const lineItems = current
    ? invoices.filter(
        (invoice) =>
          invoice.session === current.session && invoice.semester === current.semester,
      )
    : [];

  const liability = lineItems.reduce((sum, invoice) => sum + invoice.amount, 0);
  const settled = lineItems.reduce((sum, invoice) => sum + invoice.amount_paid, 0);
  const outstanding = lineItems.reduce((sum, invoice) => sum + invoice.balance, 0);
  const overdue = lineItems.filter((invoice) => invoice.status === "overdue");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PayForm>({
    resolver: zodResolver(paySchema),
    defaultValues: { amount: 0, method: "bank_transfer" },
  });

  // Prefill with the full balance — settling up is the common case.
  useEffect(() => {
    reset({ amount: outstanding, method: "bank_transfer" });
  }, [outstanding, reset]);

  const onPay = handleSubmit((values) => {
    settle.mutate(paySchema.parse(values));
  });

  if (isError) {
    return <ErrorState message={getErrorMessage(error)} onRetry={() => void refetch()} />;
  }

  return (
    <>
      <PageHeader
        title="Financial Statement & Payment Gateway"
        description={
          current
            ? `${current.session} · ${titleCase(current.semester)} semester`
            : "Your billing account."
        }
      />

      {overdue.length > 0 ? (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
          <AlertTriangle className="mt-0.5 size-5 shrink-0 text-red-600" />
          <div>
            <p className="font-medium text-red-900">
              {overdue.length} charge{overdue.length === 1 ? " is" : "s are"} past due
            </p>
            <p className="mt-0.5 text-sm text-red-700">
              Settle your balance to keep your registration and exam access active.
            </p>
          </div>
        </div>
      ) : null}

      {isPending ? (
        <Card>
          <LoadingState label="Loading your statement…" />
        </Card>
      ) : lineItems.length === 0 ? (
        <Card>
          <EmptyState
            title="Nothing billed yet"
            description="Charges for the semester appear here once the bursary issues them."
            icon={<Receipt className="size-5" />}
          />
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-5">
          {/* ---- Billing breakdown --------------------------------------- */}
          <Card className="lg:col-span-3">
            <CardHeader
              title="Current semester billing breakdown"
              description="Every charge on your account this semester."
            />
            <TableWrap>
              <thead>
                <tr>
                  <Th>Charge</Th>
                  <Th>Due</Th>
                  <Th>Status</Th>
                  <Th align="right">Amount</Th>
                </tr>
              </thead>
              <tbody>
                {lineItems.map((invoice) => (
                  <Tr key={invoice.id}>
                    <Td>
                      <p className="font-medium text-ink-900">{invoice.description}</p>
                      <p className="font-mono text-xs text-ink-500">{invoice.reference}</p>
                    </Td>
                    <Td className="text-xs">{formatDate(invoice.due_date)}</Td>
                    <Td>
                      <StatusBadge status={invoice.status} />
                    </Td>
                    <Td align="right" className="tabular-nums">
                      {formatCurrency(invoice.amount)}
                    </Td>
                  </Tr>
                ))}
              </tbody>

              {/* Totals read as a continuation of the statement, so they stay
                  inside the same table rather than in a separate card. */}
              <tfoot>
                <tr className="bg-ink-50/70">
                  <Td colSpan={3} className="font-semibold text-ink-900">
                    Total semester liability
                  </Td>
                  <Td align="right" className="font-semibold tabular-nums text-ink-900">
                    {formatCurrency(liability)}
                  </Td>
                </tr>
                <tr className="bg-ink-50/70">
                  <Td colSpan={3} className="text-emerald-800">
                    Amount already settled
                  </Td>
                  <Td align="right" className="tabular-nums text-emerald-800">
                    −{formatCurrency(settled)}
                  </Td>
                </tr>
                <tr className={outstanding > 0 ? "bg-red-50" : "bg-emerald-50"}>
                  <Td
                    colSpan={3}
                    className={cn(
                      "border-b-0 text-base font-bold uppercase tracking-wide",
                      outstanding > 0 ? "text-red-900" : "text-emerald-900",
                    )}
                  >
                    Outstanding balance owed
                  </Td>
                  <Td
                    align="right"
                    className={cn(
                      "border-b-0 text-base font-bold tabular-nums",
                      outstanding > 0 ? "text-red-900" : "text-emerald-900",
                    )}
                  >
                    {formatCurrency(outstanding)}
                  </Td>
                </tr>
              </tfoot>
            </TableWrap>
          </Card>

          {/* ---- Payment gateway ----------------------------------------- */}
          <div className="space-y-6 lg:col-span-2">
            <Card>
              <CardHeader
                title={
                  <span className="flex items-center gap-2">
                    <CreditCard className="size-4 text-brand-600" />
                    Pay outstanding balance
                  </span>
                }
                description={
                  outstanding > 0
                    ? `${formatCurrency(outstanding)} due on your account.`
                    : "Your account is fully settled."
                }
              />
              <CardBody>
                {outstanding > 0 ? (
                  <form className="space-y-4" onSubmit={onPay}>
                    <Input
                      label="Amount to pay"
                      type="number"
                      min={0}
                      max={outstanding}
                      step="0.01"
                      hint={`You may pay part of the ${formatCurrency(outstanding)} owed.`}
                      error={errors.amount?.message}
                      {...register("amount")}
                    />

                    <Select label="Method" error={errors.method?.message} {...register("method")}>
                      {METHODS.map((method) => (
                        <option key={method.value} value={method.value}>
                          {method.label}
                        </option>
                      ))}
                    </Select>

                    <Button
                      type="submit"
                      size="lg"
                      className="w-full"
                      icon={<Zap className="size-4" />}
                      loading={settle.isPending}
                    >
                      Authorize & Process Payment
                    </Button>

                    <p className="text-center text-xs text-ink-500">
                      Payments clear the oldest charge on your account first.
                    </p>
                  </form>
                ) : (
                  <div className="rounded-lg bg-emerald-50 p-4 text-center">
                    <p className="font-medium text-emerald-900">No balance owed</p>
                    <p className="mt-1 text-sm text-emerald-700">
                      You are cleared for registration and examinations.
                    </p>
                  </div>
                )}
              </CardBody>
            </Card>

            <Card>
              <CardHeader title="Payment history" />
              <CardBody>
                {history.isPending ? (
                  <LoadingState label="Loading payments…" />
                ) : (history.data ?? []).length === 0 ? (
                  <p className="py-4 text-center text-sm text-ink-500">
                    No payments recorded yet.
                  </p>
                ) : (
                  <ul className="divide-y divide-ink-100">
                    {(history.data ?? [])
                      .slice()
                      .reverse()
                      .map((payment) => (
                        <li
                          key={payment.id}
                          className="flex items-start justify-between gap-4 py-3"
                        >
                          <div className="min-w-0">
                            <p className="font-medium text-ink-900">
                              {formatCurrency(payment.amount)}
                            </p>
                            <p className="truncate text-xs text-ink-500">
                              {titleCase(payment.method)} · {payment.reference}
                            </p>
                          </div>
                          <span className="shrink-0 text-xs text-ink-500">
                            {formatDateTime(payment.paid_at)}
                          </span>
                        </li>
                      ))}
                  </ul>
                )}
              </CardBody>
            </Card>
          </div>
        </div>
      )}
    </>
  );
}
