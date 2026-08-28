import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { rethrowWithMessage } from '../utils/http-error.util';
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
      .pipe(catchError(rethrowWithMessage));
  }

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.baseUrl}/auth/login`, request)
      .pipe(catchError(rethrowWithMessage));
  }

  getBuildingByCode(code: string): Observable<BuildingSummary> {
    return this.http
      .get<BuildingSummary>(`${this.baseUrl}/auth/building-by-code/${encodeURIComponent(code)}`)
      .pipe(catchError(rethrowWithMessage));
  }

  me(): Observable<MeResponse> {
    return this.http.get<MeResponse>(`${this.baseUrl}/auth/me`).pipe(catchError(rethrowWithMessage));
  }

  resubmitJoinRequest(request: JoinBuildingRequest): Observable<{ message: string }> {
    return this.http
      .post<{ message: string }>(`${this.baseUrl}/auth/resubmit-join-request`, request)
      .pipe(catchError(rethrowWithMessage));
  }

  forgotPassword(request: ForgotPasswordRequest): Observable<{ message: string }> {
    return this.http
      .post<{ message: string }>(`${this.baseUrl}/auth/forgot-password`, request)
      .pipe(catchError(rethrowWithMessage));
  }

  resetPassword(request: ResetPasswordRequest): Observable<{ message: string }> {
    return this.http
      .post<{ message: string }>(`${this.baseUrl}/auth/reset-password`, request)
      .pipe(catchError(rethrowWithMessage));
  }
}
