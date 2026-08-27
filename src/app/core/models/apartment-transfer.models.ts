// DebtHandling: TransfersToNewOwner = 0, StaysWithPreviousOwner = 1

export interface TransferApartmentResult {
  message: string;
  outstandingBalance: number;
  debtHandling: number;
}

export interface ApartmentTransferRecord {
  id: number;
  previousOwnerName: string | null;
  transferredByName: string;
  debtHandling: number;
  outstandingBalanceAtTransfer: number;
  transferredAt: string;
}
