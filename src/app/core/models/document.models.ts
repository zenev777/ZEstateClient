// DocumentType: Protocol = 0, Contract = 1, Invoice = 2, Other = 3
// DocumentAccess: All = 0, ManagerOnly = 1

export interface DocumentItem {
  id: number;
  fileName: string;
  type: number;
  access: number;
  uploadedAt: string;
  repairId: number | null;
  meetingId: number | null;
}

export type DocumentTypeName = 'Protocol' | 'Contract' | 'Invoice' | 'Other';
export type DocumentAccessName = 'All' | 'ManagerOnly';
