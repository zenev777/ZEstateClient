import { Injectable } from '@angular/core';
import { AuthResponse, BuildingSummary, ManagerPersonalInfo } from '../models/auth.models';

/**
 * Holds state between the multi-step registration screens (in memory only —
 * the actual POST /auth/register call happens once, at the end of each wizard).
 */
@Injectable({ providedIn: 'root' })
export class RegistrationWizardService {
  managerInfo: ManagerPersonalInfo | null = null;
  managerResult: AuthResponse | null = null;

  residentBuilding: BuildingSummary | null = null;

  setManagerInfo(info: ManagerPersonalInfo): void {
    this.managerInfo = info;
  }

  setManagerResult(result: AuthResponse): void {
    this.managerResult = result;
  }

  setResidentBuilding(building: BuildingSummary): void {
    this.residentBuilding = building;
  }

  reset(): void {
    this.managerInfo = null;
    this.managerResult = null;
    this.residentBuilding = null;
  }
}
