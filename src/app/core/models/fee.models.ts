// FeeType: Fixed = 0, PerIdealPart = 1, Repair = 2
// FeeFrequency: OneTime = 0, Monthly = 1
// FeePriority: Low = 0, Normal = 1, High = 2, Urgent = 3
// ObligationStatus: Pending = 0, PartiallyPaid = 1, Paid = 2, Overdue = 3

export interface FeeSummary {
  id: number;
  title: string;
  description: string | null;
  amount: number;
  type: number;
  frequency: number;
  dateFrom: string;
  dateTo: string | null;
  priority: number;
  createdAt: string;
}

export interface FeeFormRequest {
  title: string;
  description?: string | null;
  amount: number;
  type: 'Fixed' | 'PerIdealPart';
  frequency: 'OneTime' | 'Monthly';
  dateFrom: string;
  dateTo?: string | null;
  priority: 'Low' | 'Normal' | 'High' | 'Urgent';
}

export interface ObligationSummary {
  id: number;
  apartmentNumber: string;
  feeTitle: string;
  amount: number;
  status: number;
  period: string | null;
  dueDate: string | null;
  dateCreated: string;
}

export interface GenerateObligationsResult {
  created: number;
  skippedExisting: number;
}

export interface ObligationPreviewFeeItem {
  feeTitle: string;
  apartmentCount: number;
  totalAmount: number;
}

export interface ObligationGenerationPreview {
  apartmentCount: number;
  totalAmount: number;
  fees: ObligationPreviewFeeItem[];
}

export interface ObligationStatusCount {
  count: number;
  total: number;
}

export interface ObligationsSummary {
  pending: ObligationStatusCount;
  partiallyPaid: ObligationStatusCount;
  paid: ObligationStatusCount;
  overdue: ObligationStatusCount;
}
