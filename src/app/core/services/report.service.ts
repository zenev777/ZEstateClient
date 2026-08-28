import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { rethrowWithMessage } from '../utils/http-error.util';
import { BalanceHistoryPoint, FinancialSummary } from '../models/report.models';

@Injectable({ providedIn: 'root' })
export class ReportService {
  private readonly baseUrl = environment.apiUrl;

  constructor(private readonly http: HttpClient) {}

  getSummary(from: string, to: string): Observable<FinancialSummary> {
    const params = new HttpParams().set('from', from).set('to', to);
    return this.http
      .get<FinancialSummary>(`${this.baseUrl}/reports/summary`, { params })
      .pipe(catchError(rethrowWithMessage));
  }

  getBalanceHistory(months = 12): Observable<BalanceHistoryPoint[]> {
    const params = new HttpParams().set('months', months);
    return this.http
      .get<BalanceHistoryPoint[]>(`${this.baseUrl}/reports/balance-history`, { params })
      .pipe(catchError(rethrowWithMessage));
  }

  exportCsv(from: string, to: string): Observable<Blob> {
    const params = new HttpParams().set('from', from).set('to', to);
    return this.http
      .get(`${this.baseUrl}/reports/export`, { params, responseType: 'blob' })
      .pipe(catchError(rethrowWithMessage));
  }
}
