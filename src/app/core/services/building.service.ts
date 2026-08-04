import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ApartmentFormRequest,
  ApartmentListResponse,
  ApartmentSummary,
  BuildingSummary,
  JoinRequestSummary,
  UpdateBuildingRequest,
} from '../models/auth.models';

@Injectable({ providedIn: 'root' })
export class BuildingService {
  private readonly baseUrl = environment.apiUrl;

  constructor(private readonly http: HttpClient) {}

  getPendingJoinRequests(): Observable<JoinRequestSummary[]> {
    return this.http.get<JoinRequestSummary[]>(`${this.baseUrl}/buildings/my/join-requests`);
  }

  approve(id: number): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.baseUrl}/buildings/join-requests/${id}/approve`, {});
  }

  reject(id: number): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.baseUrl}/buildings/join-requests/${id}/reject`, {});
  }

  getMyBuilding(): Observable<BuildingSummary> {
    return this.http
      .get<BuildingSummary>(`${this.baseUrl}/buildings/my`)
      .pipe(catchError(this.rethrowWithMessage));
  }

  updateMyBuilding(request: UpdateBuildingRequest): Observable<BuildingSummary> {
    return this.http
      .put<BuildingSummary>(`${this.baseUrl}/buildings/my`, request)
      .pipe(catchError(this.rethrowWithMessage));
  }

  getApartments(): Observable<ApartmentListResponse> {
    return this.http
      .get<ApartmentListResponse>(`${this.baseUrl}/buildings/my/apartments`)
      .pipe(catchError(this.rethrowWithMessage));
  }

  createApartment(request: ApartmentFormRequest): Observable<ApartmentSummary> {
    return this.http
      .post<ApartmentSummary>(`${this.baseUrl}/buildings/my/apartments`, request)
      .pipe(catchError(this.rethrowWithMessage));
  }

  updateApartment(id: number, request: ApartmentFormRequest): Observable<ApartmentSummary> {
    return this.http
      .put<ApartmentSummary>(`${this.baseUrl}/buildings/my/apartments/${id}`, request)
      .pipe(catchError(this.rethrowWithMessage));
  }

  deleteApartment(id: number): Observable<{ message: string }> {
    return this.http
      .delete<{ message: string }>(`${this.baseUrl}/buildings/my/apartments/${id}`)
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
