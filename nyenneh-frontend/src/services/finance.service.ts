import { get, post, unwrapList } from "./api";
import { fromPaymentMethod, num, toInvoice, toPayment } from "./adapters";
import { endpoints } from "./endpoints";
import type { Invoice, InvoiceStatus, Payment, PaymentMethod, PaymentResult } from "@/types";

type Row = Record<string, unknown>;

export interface InvoiceFilters {
  search?: string;
  status?: InvoiceStatus | "";
  session?: string;
}

// Invoices come from the session's fee structure, we don't type amounts in by
// hand - so issuing one means naming a cohort and a period.
export interface InvoiceInput {
  session: number;
  semester?: number | null;
  students: number[];
  due_date?: string | null;
}

export interface PaymentInput {
  invoice: number;
  amount: number;
  method: PaymentMethod;
  reference?: string;
}

// A student paying off their balance. No invoice id - it is a lump sum and
// the server spreads it over the outstanding invoices. Keeps the allocation
// rules in one place instead of us reimplementing them here.
export interface SettleInput {
  amount: number;
  method: PaymentMethod;
}

// "overdue" is ours, the server can't filter on it
function invoiceParams(filters: InvoiceFilters) {
  const { status, ...rest } = filters;
  if (!status) return rest;
  if (status === "overdue") return { ...rest, outstanding: "true" };
  return { ...rest, status: status.toUpperCase() };
}

export const financeService = {
  listInvoices: async (filters: InvoiceFilters = {}): Promise<Invoice[]> => {
    const rows = unwrapList(
      await get<Row[]>(endpoints.finance.invoices, { params: invoiceParams(filters) }),
    ).map(toInvoice);
    // so narrow it down here instead
    return filters.status === "overdue"
      ? rows.filter((invoice) => invoice.status === "overdue")
      : rows;
  },

  createInvoice: async (payload: InvoiceInput) => {
    const data = await post<{ created: Row[] }>(endpoints.finance.generateInvoices, payload);
    return (data.created ?? []).map(toInvoice);
  },

  // already scoped to the signed-in student by the server
  myInvoices: async (): Promise<Invoice[]> =>
    unwrapList(await get<Row[]>(endpoints.finance.invoices)).map(toInvoice),

  listPayments: async (params: { invoice?: number } = {}): Promise<Payment[]> =>
    unwrapList(await get<Row[]>(endpoints.finance.payments, { params })).map(toPayment),

  // Payment taken at the bursary desk. It lands unconfirmed, and it is the
  // confirm call that actually moves the invoice balance.
  recordPayment: async (payload: PaymentInput): Promise<Payment> => {
    const created = await post<Row>(endpoints.finance.payments, {
      invoice: payload.invoice,
      amount: payload.amount,
      method: fromPaymentMethod(payload.method),
      gateway_reference: payload.reference ?? "",
    });
    return toPayment(await post<Row>(endpoints.finance.confirmPayment(Number(created.id))));
  },

  settleBalance: async (payload: SettleInput): Promise<PaymentResult> => {
    const data = await post<{ amount_paid: unknown; payments: Row[]; balance: unknown }>(
      endpoints.finance.pay,
      { amount: payload.amount, method: fromPaymentMethod(payload.method) },
    );
    return {
      amount_paid: num(data.amount_paid),
      payments: (data.payments ?? []).map(toPayment),
      balance: num(data.balance),
    };
  },
};
