import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
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
    return this.http.get<FeeSummary[]>(`${this.baseUrl}/fees`).pipe(catchError(this.rethrowWithMessage));
  }

  createFee(request: FeeFormRequest): Observable<FeeSummary> {
    return this.http
      .post<FeeSummary>(`${this.baseUrl}/fees`, request)
      .pipe(catchError(this.rethrowWithMessage));
  }

  updateFee(id: number, request: FeeFormRequest): Observable<FeeSummary> {
    return this.http
      .put<FeeSummary>(`${this.baseUrl}/fees/${id}`, request)
      .pipe(catchError(this.rethrowWithMessage));
  }

  deleteFee(id: number): Observable<{ message: string }> {
    return this.http
      .delete<{ message: string }>(`${this.baseUrl}/fees/${id}`)
      .pipe(catchError(this.rethrowWithMessage));
  }

  generateObligations(): Observable<GenerateObligationsResult> {
    return this.http
      .post<GenerateObligationsResult>(`${this.baseUrl}/fees/generate-obligations`, {})
      .pipe(catchError(this.rethrowWithMessage));
  }

  getObligations(): Observable<ObligationSummary[]> {
    return this.http
      .get<ObligationSummary[]>(`${this.baseUrl}/fees/obligations`)
      .pipe(catchError(this.rethrowWithMessage));
  }

  getObligationsSummary(): Observable<ObligationsSummary> {
    return this.http
      .get<ObligationsSummary>(`${this.baseUrl}/fees/obligations/summary`)
      .pipe(catchError(this.rethrowWithMessage));
  }

  markOverdue(): Observable<{ markedOverdue: number }> {
    return this.http
      .post<{ markedOverdue: number }>(`${this.baseUrl}/fees/mark-overdue`, {})
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
