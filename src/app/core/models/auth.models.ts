export type UserRole = 'HouseManager' | 'Resident';
export type ResidentStatus = 'Owner' | 'Resident';

export interface CreateBuildingRequest {
  name: string;
  address: string;
  livesInBuilding: boolean;
  apartmentNumber?: string | null;
  floor?: number | null;
}

export interface JoinBuildingRequest {
  inviteCode: string;
  apartmentNumber: string;
  status: ResidentStatus;
  notes?: string | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface JoinRequestSummary {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  apartmentNumber: string;
  requestedRole: number;
  notes: string | null;
  createdAt: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string | null;
  password: string;
  confirmPassword: string;
  role: UserRole;
  building?: CreateBuildingRequest;
  joinBuilding?: JoinBuildingRequest;
}

export interface AuthResponse {
  token: string;
  email: string;
  name: string;
  roles: string[];
  buildingInviteCode?: string | null;
}

export interface BuildingSummary {
  id: number;
  name: string;
  address: string;
  inviteCode: string;
  inviteCodeActive: boolean;
  inviteCodeExpiresAt: string | null;
  inviteCodeMaxUses: number | null;
  inviteCodeUseCount: number;
}

export interface InviteCodeLimitsRequest {
  expiresAt: string | null;
  maxUses: number | null;
}

// Съответства на ZEstate.Infrastructure.Data.Enums.InviteCodeAction (сериализира се като число)
export interface InviteCodeLogEntry {
  id: number;
  action: number;
  oldCode: string | null;
  newCode: string | null;
  changedAt: string;
  changedByName: string;
}

export interface UpdateBuildingRequest {
  name: string;
  address: string;
}

export interface ApartmentSummary {
  id: number;
  number: string;
  floor: number;
  idealParts: number;
  budget: number;
}

export interface ApartmentListResponse {
  apartments: ApartmentSummary[];
  idealPartsTotal: number;
}

export interface ApartmentFormRequest {
  number: string;
  floor: number;
  idealParts: number;
}

/** Personal-info step held in memory while the house-manager wizard collects the building step. */
export interface ManagerPersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
}

export type MembershipStatus = 'None' | 'Pending' | 'Approved' | 'Rejected';

export interface MeResponse {
  role: UserRole;
  membershipStatus?: MembershipStatus;
  buildingName?: string | null;
  apartmentNumber?: string | null;
  canRetry?: boolean;
}
