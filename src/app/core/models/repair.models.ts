// RepairStatus: Planned = 0, InProgress = 1, Completed = 2

export interface RepairSummary {
  id: number;
  title: string;
  description: string | null;
  budget: number;
  actualCost: number | null;
  status: number;
  createdAt: string;
  costsAllocated: boolean;
}

export interface RepairFormRequest {
  title: string;
  description?: string | null;
  budget: number;
}

export interface RepairUpdateRequest extends RepairFormRequest {
  actualCost?: number | null;
  status: 'Planned' | 'InProgress' | 'Completed';
}

export interface RepairDocument {
  id: number;
  fileName: string;
  type: number;
  uploadedAt: string;
}

export interface AllocateCostsResult {
  feeId: number;
  obligationsCreated: number;
  totalCost: number;
}
