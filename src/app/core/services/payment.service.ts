import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { rethrowWithMessage } from '../utils/http-error.util';
import { PaymentHistoryEntry, RegisterPaymentRequest, RegisterPaymentResult } from '../models/payment.models';

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private readonly baseUrl = environment.apiUrl;

  constructor(private readonly http: HttpClient) {}

  registerPayment(request: RegisterPaymentRequest): Observable<RegisterPaymentResult> {
    return this.http
      .post<RegisterPaymentResult>(`${this.baseUrl}/payments`, request)
      .pipe(catchError(rethrowWithMessage));
  }

  getPayments(filter: { apartmentId?: number | null; from?: string | null; to?: string | null }): Observable<PaymentHistoryEntry[]> {
    let params = new HttpParams();
    if (filter.apartmentId) params = params.set('apartmentId', filter.apartmentId);
    if (filter.from) params = params.set('from', filter.from);
    if (filter.to) params = params.set('to', filter.to);

    return this.http
      .get<PaymentHistoryEntry[]>(`${this.baseUrl}/payments`, { params })
      .pipe(catchError(rethrowWithMessage));
  }

  // Any building member paying their own obligation online (Stripe Checkout) -
  // resolves to a hosted checkout URL to redirect the browser to.
  createCheckout(obligationId: number): Observable<{ checkoutUrl: string }> {
    return this.http
      .post<{ checkoutUrl: string }>(`${this.baseUrl}/payments/checkout/${obligationId}`, {})
      .pipe(catchError(rethrowWithMessage));
  }
}
