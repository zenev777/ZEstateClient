import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AllocateCostsResult,
  RepairDocument,
  RepairFormRequest,
  RepairSummary,
  RepairUpdateRequest,
} from '../models/repair.models';

@Injectable({ providedIn: 'root' })
export class RepairService {
  private readonly baseUrl = environment.apiUrl;

  constructor(private readonly http: HttpClient) {}

  getRepairs(): Observable<RepairSummary[]> {
    return this.http
      .get<RepairSummary[]>(`${this.baseUrl}/repairs`)
      .pipe(catchError(this.rethrowWithMessage));
  }

  createRepair(request: RepairFormRequest): Observable<RepairSummary> {
    return this.http
      .post<RepairSummary>(`${this.baseUrl}/repairs`, request)
      .pipe(catchError(this.rethrowWithMessage));
  }

  updateRepair(id: number, request: RepairUpdateRequest): Observable<RepairSummary> {
    return this.http
      .put<RepairSummary>(`${this.baseUrl}/repairs/${id}`, request)
      .pipe(catchError(this.rethrowWithMessage));
  }

  deleteRepair(id: number): Observable<{ message: string }> {
    return this.http
      .delete<{ message: string }>(`${this.baseUrl}/repairs/${id}`)
      .pipe(catchError(this.rethrowWithMessage));
  }

  allocateCosts(id: number): Observable<AllocateCostsResult> {
    return this.http
      .post<AllocateCostsResult>(`${this.baseUrl}/repairs/${id}/allocate-costs`, {})
      .pipe(catchError(this.rethrowWithMessage));
  }

  uploadDocument(repairId: number, file: File): Observable<RepairDocument> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http
      .post<RepairDocument>(`${this.baseUrl}/repairs/${repairId}/documents`, formData)
      .pipe(catchError(this.rethrowWithMessage));
  }

  getDocuments(repairId: number): Observable<RepairDocument[]> {
    return this.http
      .get<RepairDocument[]>(`${this.baseUrl}/repairs/${repairId}/documents`)
      .pipe(catchError(this.rethrowWithMessage));
  }

  downloadDocument(documentId: number): Observable<Blob> {
    return this.http
      .get(`${this.baseUrl}/documents/${documentId}/download`, { responseType: 'blob' })
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
