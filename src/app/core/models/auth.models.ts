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
