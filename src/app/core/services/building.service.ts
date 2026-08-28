import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { rethrowWithMessage } from '../utils/http-error.util';
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
import { BuildingRegisterEntry } from '../models/building-register.models';

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
      .pipe(catchError(rethrowWithMessage));
  }

  updateIban(iban: string): Observable<BuildingSummary> {
    return this.http
      .put<BuildingSummary>(`${this.baseUrl}/buildings/my/iban`, { iban })
      .pipe(catchError(rethrowWithMessage));
  }

  updateMyBuilding(request: UpdateBuildingRequest): Observable<BuildingSummary> {
    return this.http
      .put<BuildingSummary>(`${this.baseUrl}/buildings/my`, request)
      .pipe(catchError(rethrowWithMessage));
  }

  getApartments(): Observable<ApartmentListResponse> {
    return this.http
      .get<ApartmentListResponse>(`${this.baseUrl}/buildings/my/apartments`)
      .pipe(catchError(rethrowWithMessage));
  }

  createApartment(request: ApartmentFormRequest): Observable<ApartmentSummary> {
    return this.http
      .post<ApartmentSummary>(`${this.baseUrl}/buildings/my/apartments`, request)
      .pipe(catchError(rethrowWithMessage));
  }

  updateApartment(id: number, request: ApartmentFormRequest): Observable<ApartmentSummary> {
    return this.http
      .put<ApartmentSummary>(`${this.baseUrl}/buildings/my/apartments/${id}`, request)
      .pipe(catchError(rethrowWithMessage));
  }

  deleteApartment(id: number): Observable<{ message: string }> {
    return this.http
      .delete<{ message: string }>(`${this.baseUrl}/buildings/my/apartments/${id}`)
      .pipe(catchError(rethrowWithMessage));
  }

  regenerateInviteCode(): Observable<BuildingSummary> {
    return this.http
      .post<BuildingSummary>(`${this.baseUrl}/buildings/my/invite-code/regenerate`, {})
      .pipe(catchError(rethrowWithMessage));
  }

  revokeInviteCode(): Observable<BuildingSummary> {
    return this.http
      .post<BuildingSummary>(`${this.baseUrl}/buildings/my/invite-code/revoke`, {})
      .pipe(catchError(rethrowWithMessage));
  }

  updateInviteCodeLimits(request: InviteCodeLimitsRequest): Observable<BuildingSummary> {
    return this.http
      .put<BuildingSummary>(`${this.baseUrl}/buildings/my/invite-code/limits`, request)
      .pipe(catchError(rethrowWithMessage));
  }

  getInviteCodeLog(): Observable<InviteCodeLogEntry[]> {
    return this.http
      .get<InviteCodeLogEntry[]>(`${this.baseUrl}/buildings/my/invite-code/log`)
      .pipe(catchError(rethrowWithMessage));
  }

  updateQuorumThreshold(quorumThresholdPercent: number): Observable<BuildingSummary> {
    return this.http
      .put<BuildingSummary>(`${this.baseUrl}/buildings/my/quorum-threshold`, { quorumThresholdPercent })
      .pipe(catchError(rethrowWithMessage));
  }

  transferApartment(id: number, debtHandling: 'TransfersToNewOwner' | 'StaysWithPreviousOwner'): Observable<TransferApartmentResult> {
    return this.http
      .post<TransferApartmentResult>(`${this.baseUrl}/buildings/my/apartments/${id}/transfer`, { debtHandling })
      .pipe(catchError(rethrowWithMessage));
  }

  getApartmentTransfers(id: number): Observable<ApartmentTransferRecord[]> {
    return this.http
      .get<ApartmentTransferRecord[]>(`${this.baseUrl}/buildings/my/apartments/${id}/transfers`)
      .pipe(catchError(rethrowWithMessage));
  }

  getRegister(): Observable<BuildingRegisterEntry[]> {
    return this.http
      .get<BuildingRegisterEntry[]>(`${this.baseUrl}/buildings/my/register`)
      .pipe(catchError(rethrowWithMessage));
  }

  exportRegister(): Observable<Blob> {
    return this.http
      .get(`${this.baseUrl}/buildings/my/register/export`, { responseType: 'blob' })
      .pipe(catchError(rethrowWithMessage));
  }
}
