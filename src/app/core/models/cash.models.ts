export interface CashBalances {
  cashBalance: number;
  bankBalance: number;
}

export interface TransferFundsRequest {
  from: 'Cash' | 'Bank';
  amount: number;
  note?: string | null;
}

export interface CashLedgerEntry {
  id: number;
  // CashAccountType: Cash = 0, Bank = 1
  account: number;
  amount: number;
  description: string;
  createdAt: string;
}
