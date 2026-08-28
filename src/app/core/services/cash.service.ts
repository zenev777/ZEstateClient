import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { rethrowWithMessage } from '../utils/http-error.util';
import { CashBalances, CashLedgerEntry, TransferFundsRequest, WithdrawForRepairRequest } from '../models/cash.models';

@Injectable({ providedIn: 'root' })
export class CashService {
  private readonly baseUrl = environment.apiUrl;

  constructor(private readonly http: HttpClient) {}

  getBalances(): Observable<CashBalances> {
    return this.http
      .get<CashBalances>(`${this.baseUrl}/cash/balances`)
      .pipe(catchError(rethrowWithMessage));
  }

  transfer(request: TransferFundsRequest): Observable<{ message: string }> {
    return this.http
      .post<{ message: string }>(`${this.baseUrl}/cash/transfer`, request)
      .pipe(catchError(rethrowWithMessage));
  }

  getHistory(): Observable<CashLedgerEntry[]> {
    return this.http
      .get<CashLedgerEntry[]>(`${this.baseUrl}/cash/history`)
      .pipe(catchError(rethrowWithMessage));
  }

  withdrawForRepair(request: WithdrawForRepairRequest): Observable<{ message: string }> {
    return this.http
      .post<{ message: string }>(`${this.baseUrl}/cash/withdraw-for-repair`, request)
      .pipe(catchError(rethrowWithMessage));
  }
}
