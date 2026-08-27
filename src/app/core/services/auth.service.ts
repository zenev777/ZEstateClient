import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AuthResponse,
  BuildingSummary,
  ForgotPasswordRequest,
  JoinBuildingRequest,
  LoginRequest,
  MeResponse,
  RegisterRequest,
  ResetPasswordRequest,
} from '../models/auth.models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly baseUrl = environment.apiUrl;

  constructor(private readonly http: HttpClient) {}

  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.baseUrl}/auth/register`, request)
      .pipe(catchError(this.rethrowWithMessage));
  }

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.baseUrl}/auth/login`, request)
      .pipe(catchError(this.rethrowWithMessage));
  }

  getBuildingByCode(code: string): Observable<BuildingSummary> {
    return this.http
      .get<BuildingSummary>(`${this.baseUrl}/auth/building-by-code/${encodeURIComponent(code)}`)
      .pipe(catchError(this.rethrowWithMessage));
  }

  me(): Observable<MeResponse> {
    return this.http.get<MeResponse>(`${this.baseUrl}/auth/me`).pipe(catchError(this.rethrowWithMessage));
  }

  resubmitJoinRequest(request: JoinBuildingRequest): Observable<{ message: string }> {
    return this.http
      .post<{ message: string }>(`${this.baseUrl}/auth/resubmit-join-request`, request)
      .pipe(catchError(this.rethrowWithMessage));
  }

  forgotPassword(request: ForgotPasswordRequest): Observable<{ message: string }> {
    return this.http
      .post<{ message: string }>(`${this.baseUrl}/auth/forgot-password`, request)
      .pipe(catchError(this.rethrowWithMessage));
  }

  resetPassword(request: ResetPasswordRequest): Observable<{ message: string }> {
    return this.http
      .post<{ message: string }>(`${this.baseUrl}/auth/reset-password`, request)
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
