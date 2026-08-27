import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PaymentHistoryEntry, RegisterPaymentRequest, RegisterPaymentResult } from '../models/payment.models';

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private readonly baseUrl = environment.apiUrl;

  constructor(private readonly http: HttpClient) {}

  registerPayment(request: RegisterPaymentRequest): Observable<RegisterPaymentResult> {
    return this.http
      .post<RegisterPaymentResult>(`${this.baseUrl}/payments`, request)
      .pipe(catchError(this.rethrowWithMessage));
  }

  getPayments(filter: { apartmentId?: number | null; from?: string | null; to?: string | null }): Observable<PaymentHistoryEntry[]> {
    let params = new HttpParams();
    if (filter.apartmentId) params = params.set('apartmentId', filter.apartmentId);
    if (filter.from) params = params.set('from', filter.from);
    if (filter.to) params = params.set('to', filter.to);

    return this.http
      .get<PaymentHistoryEntry[]>(`${this.baseUrl}/payments`, { params })
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
