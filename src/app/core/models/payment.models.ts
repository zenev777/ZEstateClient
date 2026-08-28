export interface RegisterPaymentRequest {
  apartmentId: number;
  amount: number;
  paidAt: string;
  method: 'Manual' | 'Stripe';
  // Which till the money actually landed in - only meaningful for 'Manual' (Stripe
  // always lands in Bank server-side regardless of this); defaults to Cash if omitted.
  account?: 'Cash' | 'Bank' | null;
  note?: string | null;
}

export interface PaymentAllocation {
  id: number;
  feeTitle: string;
  amountApplied: number;
  status: number;
}

export interface RegisterPaymentResult {
  totalAmount: number;
  allocations: PaymentAllocation[];
  creditApplied: number;
}

export interface PaymentHistoryEntry {
  id: number;
  apartmentNumber: string;
  feeTitle: string;
  amount: number;
  paidAt: string;
  method: number;
  note: string | null;
}
