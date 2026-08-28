import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { rethrowWithMessage } from '../utils/http-error.util';
import { BuildingMember, ManagerTransferStatus } from '../models/role-management.models';

@Injectable({ providedIn: 'root' })
export class RoleManagementService {
  private readonly baseUrl = environment.apiUrl;

  constructor(private readonly http: HttpClient) {}

  getBuildingMembers(): Observable<BuildingMember[]> {
    return this.http
      .get<BuildingMember[]>(`${this.baseUrl}/users/building-members`)
      .pipe(catchError(rethrowWithMessage));
  }

  changeRole(userId: string, role: 'Resident' | 'Cashier'): Observable<{ message: string }> {
    return this.http
      .put<{ message: string }>(`${this.baseUrl}/users/${userId}/role`, { role })
      .pipe(catchError(rethrowWithMessage));
  }

  getTransferStatus(): Observable<ManagerTransferStatus> {
    return this.http
      .get<ManagerTransferStatus>(`${this.baseUrl}/manager-transfer`)
      .pipe(catchError(rethrowWithMessage));
  }

  initiateTransfer(toUserId: string, password: string): Observable<{ message: string; effectiveAt: string }> {
    return this.http
      .post<{ message: string; effectiveAt: string }>(`${this.baseUrl}/manager-transfer`, { toUserId, password })
      .pipe(catchError(rethrowWithMessage));
  }

  cancelTransfer(): Observable<{ message: string }> {
    return this.http
      .post<{ message: string }>(`${this.baseUrl}/manager-transfer/cancel`, {})
      .pipe(catchError(rethrowWithMessage));
  }
}
