import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { rethrowWithMessage } from '../utils/http-error.util';
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
      .pipe(catchError(rethrowWithMessage));
  }

  createRepair(request: RepairFormRequest): Observable<RepairSummary> {
    return this.http
      .post<RepairSummary>(`${this.baseUrl}/repairs`, request)
      .pipe(catchError(rethrowWithMessage));
  }

  updateRepair(id: number, request: RepairUpdateRequest): Observable<RepairSummary> {
    return this.http
      .put<RepairSummary>(`${this.baseUrl}/repairs/${id}`, request)
      .pipe(catchError(rethrowWithMessage));
  }

  deleteRepair(id: number): Observable<{ message: string }> {
    return this.http
      .delete<{ message: string }>(`${this.baseUrl}/repairs/${id}`)
      .pipe(catchError(rethrowWithMessage));
  }

  allocateCosts(id: number): Observable<AllocateCostsResult> {
    return this.http
      .post<AllocateCostsResult>(`${this.baseUrl}/repairs/${id}/allocate-costs`, {})
      .pipe(catchError(rethrowWithMessage));
  }

  uploadDocument(repairId: number, file: File): Observable<RepairDocument> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http
      .post<RepairDocument>(`${this.baseUrl}/repairs/${repairId}/documents`, formData)
      .pipe(catchError(rethrowWithMessage));
  }

  getDocuments(repairId: number): Observable<RepairDocument[]> {
    return this.http
      .get<RepairDocument[]>(`${this.baseUrl}/repairs/${repairId}/documents`)
      .pipe(catchError(rethrowWithMessage));
  }

  downloadDocument(documentId: number): Observable<Blob> {
    return this.http
      .get(`${this.baseUrl}/documents/${documentId}/download`, { responseType: 'blob' })
      .pipe(catchError(rethrowWithMessage));
  }
}
