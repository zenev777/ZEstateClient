export interface BuildingMember {
  userId: string;
  name: string;
  email: string;
  apartmentNumber: string;
  roles: string[];
}

export interface ManagerTransferStatus {
  pending: boolean;
  toUserId?: string;
  toUserName?: string;
  initiatedAt?: string;
  effectiveAt?: string;
}
