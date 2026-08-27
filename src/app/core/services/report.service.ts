import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { BalanceHistoryPoint, FinancialSummary } from '../models/report.models';

@Injectable({ providedIn: 'root' })
export class ReportService {
  private readonly baseUrl = environment.apiUrl;

  constructor(private readonly http: HttpClient) {}

  getSummary(from: string, to: string): Observable<FinancialSummary> {
    const params = new HttpParams().set('from', from).set('to', to);
    return this.http
      .get<FinancialSummary>(`${this.baseUrl}/reports/summary`, { params })
      .pipe(catchError(this.rethrowWithMessage));
  }

  getBalanceHistory(months = 12): Observable<BalanceHistoryPoint[]> {
    const params = new HttpParams().set('months', months);
    return this.http
      .get<BalanceHistoryPoint[]>(`${this.baseUrl}/reports/balance-history`, { params })
      .pipe(catchError(this.rethrowWithMessage));
  }

  exportCsv(from: string, to: string): Observable<Blob> {
    const params = new HttpParams().set('from', from).set('to', to);
    return this.http
      .get(`${this.baseUrl}/reports/export`, { params, responseType: 'blob' })
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
