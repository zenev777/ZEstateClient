import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { rethrowWithMessage } from '../utils/http-error.util';
import {
  FeeFormRequest,
  FeeSummary,
  GenerateObligationsResult,
  ObligationSummary,
  ObligationsSummary,
} from '../models/fee.models';

@Injectable({ providedIn: 'root' })
export class FeeService {
  private readonly baseUrl = environment.apiUrl;

  constructor(private readonly http: HttpClient) {}

  getFees(): Observable<FeeSummary[]> {
    return this.http.get<FeeSummary[]>(`${this.baseUrl}/fees`).pipe(catchError(rethrowWithMessage));
  }

  createFee(request: FeeFormRequest): Observable<FeeSummary> {
    return this.http
      .post<FeeSummary>(`${this.baseUrl}/fees`, request)
      .pipe(catchError(rethrowWithMessage));
  }

  updateFee(id: number, request: FeeFormRequest): Observable<FeeSummary> {
    return this.http
      .put<FeeSummary>(`${this.baseUrl}/fees/${id}`, request)
      .pipe(catchError(rethrowWithMessage));
  }

  deleteFee(id: number): Observable<{ message: string }> {
    return this.http
      .delete<{ message: string }>(`${this.baseUrl}/fees/${id}`)
      .pipe(catchError(rethrowWithMessage));
  }

  generateObligations(): Observable<GenerateObligationsResult> {
    return this.http
      .post<GenerateObligationsResult>(`${this.baseUrl}/fees/generate-obligations`, {})
      .pipe(catchError(rethrowWithMessage));
  }

  getObligations(): Observable<ObligationSummary[]> {
    return this.http
      .get<ObligationSummary[]>(`${this.baseUrl}/fees/obligations`)
      .pipe(catchError(rethrowWithMessage));
  }

  getObligationsSummary(): Observable<ObligationsSummary> {
    return this.http
      .get<ObligationsSummary>(`${this.baseUrl}/fees/obligations/summary`)
      .pipe(catchError(rethrowWithMessage));
  }

  // The caller's own obligations, regardless of role - unlike getObligations() above
  // this is available to any building member, not just the manager/cashier.
  getMyObligations(): Observable<ObligationSummary[]> {
    return this.http
      .get<ObligationSummary[]>(`${this.baseUrl}/fees/my-obligations`)
      .pipe(catchError(rethrowWithMessage));
  }

  markOverdue(): Observable<{ markedOverdue: number }> {
    return this.http
      .post<{ markedOverdue: number }>(`${this.baseUrl}/fees/mark-overdue`, {})
      .pipe(catchError(rethrowWithMessage));
  }
}
