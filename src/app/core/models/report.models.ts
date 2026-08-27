export interface IncomeByApartment {
  apartmentNumber: string;
  total: number;
}

// feeType: Fixed = 0, PerIdealPart = 1, Repair = 2
export interface IncomeByFeeType {
  feeType: number;
  total: number;
}

export interface ExpenseByRepair {
  id: number;
  title: string;
  amount: number;
}

export interface FinancialSummary {
  from: string;
  to: string;
  totalIncome: number;
  totalExpense: number;
  balance: number;
  incomeByApartment: IncomeByApartment[];
  incomeByFeeType: IncomeByFeeType[];
  expensesByRepair: ExpenseByRepair[];
}

export interface BalanceHistoryPoint {
  period: string;
  income: number;
  expense: number;
  balance: number;
}
