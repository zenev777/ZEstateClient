// ApartmentRole: Owner = 0, Resident = 1, HouseManager = 2
export interface BuildingRegisterMember {
  name: string;
  email: string;
  role: number;
  joinedAt: string;
}

export interface BuildingRegisterEntry {
  apartmentNumber: string;
  floor: number;
  idealParts: number;
  members: BuildingRegisterMember[];
}
