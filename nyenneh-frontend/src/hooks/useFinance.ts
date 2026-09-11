import { useQuery } from "@tanstack/react-query";

import {
  financeService,
  type InvoiceFilters,
  type InvoiceInput,
  type PaymentInput,
  type SettleInput,
} from "@/services/finance.service";
import { formatCurrency } from "@/lib/utils";
import { queryKeys } from "./queryKeys";
import { useMutationWithToast } from "./useMutationWithToast";

export function useInvoices(filters: InvoiceFilters = {}) {
  return useQuery({
    queryKey: queryKeys.finance.invoices(filters),
    queryFn: () => financeService.listInvoices(filters),
    placeholderData: (previous) => previous,
  });
}

export function useMyInvoices() {
  return useQuery({
    queryKey: queryKeys.finance.myInvoices,
    queryFn: financeService.myInvoices,
  });
}

/** Omit `invoice` for every payment the signed-in user is allowed to see. */
export function usePayments(invoice?: number) {
  return useQuery({
    queryKey: queryKeys.finance.payments({ invoice }),
    queryFn: () => financeService.listPayments({ invoice }),
  });
}

export function useCreateInvoice() {
  return useMutationWithToast({
    mutationFn: (payload: InvoiceInput) => financeService.createInvoice(payload),
    invalidates: [queryKeys.finance.all, queryKeys.dashboard.all],
    successMessage: (invoices) =>
      invoices.length === 0
        ? "Every student named already had an invoice for that period."
        : `Issued ${invoices.length} invoice${invoices.length === 1 ? "" : "s"}.`,
  });
}

export function useSettleBalance() {
  return useMutationWithToast({
    mutationFn: (payload: SettleInput) => financeService.settleBalance(payload),
    invalidates: [queryKeys.finance.all, queryKeys.dashboard.all],
    successMessage: ({ amount_paid, balance }) =>
      balance > 0
        ? `Payment of ${formatCurrency(amount_paid)} received. ${formatCurrency(balance)} still outstanding.`
        : `Payment of ${formatCurrency(amount_paid)} received. Your account is fully settled.`,
  });
}

export function useRecordPayment() {
  return useMutationWithToast({
    mutationFn: (payload: PaymentInput) => financeService.recordPayment(payload),
    invalidates: [queryKeys.finance.all, queryKeys.dashboard.all],
    successMessage: "Payment recorded.",
  });
}
