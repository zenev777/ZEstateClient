import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { BuildingMember, ManagerTransferStatus } from '../models/role-management.models';

@Injectable({ providedIn: 'root' })
export class RoleManagementService {
  private readonly baseUrl = environment.apiUrl;

  constructor(private readonly http: HttpClient) {}

  getBuildingMembers(): Observable<BuildingMember[]> {
    return this.http
      .get<BuildingMember[]>(`${this.baseUrl}/users/building-members`)
      .pipe(catchError(this.rethrowWithMessage));
  }

  changeRole(userId: string, role: 'Resident' | 'Cashier'): Observable<{ message: string }> {
    return this.http
      .put<{ message: string }>(`${this.baseUrl}/users/${userId}/role`, { role })
      .pipe(catchError(this.rethrowWithMessage));
  }

  getTransferStatus(): Observable<ManagerTransferStatus> {
    return this.http
      .get<ManagerTransferStatus>(`${this.baseUrl}/manager-transfer`)
      .pipe(catchError(this.rethrowWithMessage));
  }

  initiateTransfer(toUserId: string, password: string): Observable<{ message: string; effectiveAt: string }> {
    return this.http
      .post<{ message: string; effectiveAt: string }>(`${this.baseUrl}/manager-transfer`, { toUserId, password })
      .pipe(catchError(this.rethrowWithMessage));
  }

  cancelTransfer(): Observable<{ message: string }> {
    return this.http
      .post<{ message: string }>(`${this.baseUrl}/manager-transfer/cancel`, {})
      .pipe(catchError(this.rethrowWithMessage));
  }

  private rethrowWithMessage(error: HttpErrorResponse) {
    const body = error.error;
    let message = 'Възникна неочаквана грешка. Опитай отново.';

    if (typeof body === 'string') {
      message = body;
    } else if (body?.message) {
      message = body.message;
    } else if (Array.isArray(body)) {
      message = body.join(' ');
    } else if (body?.errors) {
      message = Object.values<string[]>(body.errors).flat().join(' ');
    }

    return throwError(() => new Error(message));
  }
}
