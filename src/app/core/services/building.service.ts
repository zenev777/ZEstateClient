import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ApartmentFormRequest,
  ApartmentListResponse,
  ApartmentSummary,
  BuildingSummary,
  InviteCodeLimitsRequest,
  InviteCodeLogEntry,
  JoinRequestSummary,
  UpdateBuildingRequest,
} from '../models/auth.models';
import { ApartmentTransferRecord, TransferApartmentResult } from '../models/apartment-transfer.models';

@Injectable({ providedIn: 'root' })
export class BuildingService {
  private readonly baseUrl = environment.apiUrl;

  constructor(private readonly http: HttpClient) {}

  getPendingJoinRequests(): Observable<JoinRequestSummary[]> {
    return this.http.get<JoinRequestSummary[]>(`${this.baseUrl}/buildings/my/join-requests`);
  }

  approve(id: number): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.baseUrl}/buildings/join-requests/${id}/approve`, {});
  }

  reject(id: number, reason?: string | null): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.baseUrl}/buildings/join-requests/${id}/reject`, { reason: reason || null });
  }

  getMyBuilding(): Observable<BuildingSummary> {
    return this.http
      .get<BuildingSummary>(`${this.baseUrl}/buildings/my`)
      .pipe(catchError(this.rethrowWithMessage));
  }

  updateMyBuilding(request: UpdateBuildingRequest): Observable<BuildingSummary> {
    return this.http
      .put<BuildingSummary>(`${this.baseUrl}/buildings/my`, request)
      .pipe(catchError(this.rethrowWithMessage));
  }

  getApartments(): Observable<ApartmentListResponse> {
    return this.http
      .get<ApartmentListResponse>(`${this.baseUrl}/buildings/my/apartments`)
      .pipe(catchError(this.rethrowWithMessage));
  }

  createApartment(request: ApartmentFormRequest): Observable<ApartmentSummary> {
    return this.http
      .post<ApartmentSummary>(`${this.baseUrl}/buildings/my/apartments`, request)
      .pipe(catchError(this.rethrowWithMessage));
  }

  updateApartment(id: number, request: ApartmentFormRequest): Observable<ApartmentSummary> {
    return this.http
      .put<ApartmentSummary>(`${this.baseUrl}/buildings/my/apartments/${id}`, request)
      .pipe(catchError(this.rethrowWithMessage));
  }

  deleteApartment(id: number): Observable<{ message: string }> {
    return this.http
      .delete<{ message: string }>(`${this.baseUrl}/buildings/my/apartments/${id}`)
      .pipe(catchError(this.rethrowWithMessage));
  }

  regenerateInviteCode(): Observable<BuildingSummary> {
    return this.http
      .post<BuildingSummary>(`${this.baseUrl}/buildings/my/invite-code/regenerate`, {})
      .pipe(catchError(this.rethrowWithMessage));
  }

  revokeInviteCode(): Observable<BuildingSummary> {
    return this.http
      .post<BuildingSummary>(`${this.baseUrl}/buildings/my/invite-code/revoke`, {})
      .pipe(catchError(this.rethrowWithMessage));
  }

  updateInviteCodeLimits(request: InviteCodeLimitsRequest): Observable<BuildingSummary> {
    return this.http
      .put<BuildingSummary>(`${this.baseUrl}/buildings/my/invite-code/limits`, request)
      .pipe(catchError(this.rethrowWithMessage));
  }

  getInviteCodeLog(): Observable<InviteCodeLogEntry[]> {
    return this.http
      .get<InviteCodeLogEntry[]>(`${this.baseUrl}/buildings/my/invite-code/log`)
      .pipe(catchError(this.rethrowWithMessage));
  }

  updateQuorumThreshold(quorumThresholdPercent: number): Observable<BuildingSummary> {
    return this.http
      .put<BuildingSummary>(`${this.baseUrl}/buildings/my/quorum-threshold`, { quorumThresholdPercent })
      .pipe(catchError(this.rethrowWithMessage));
  }

  transferApartment(id: number, debtHandling: 'TransfersToNewOwner' | 'StaysWithPreviousOwner'): Observable<TransferApartmentResult> {
    return this.http
      .post<TransferApartmentResult>(`${this.baseUrl}/buildings/my/apartments/${id}/transfer`, { debtHandling })
      .pipe(catchError(this.rethrowWithMessage));
  }

  getApartmentTransfers(id: number): Observable<ApartmentTransferRecord[]> {
    return this.http
      .get<ApartmentTransferRecord[]>(`${this.baseUrl}/buildings/my/apartments/${id}/transfers`)
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
