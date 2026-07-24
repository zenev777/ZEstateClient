import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { JoinRequestSummary } from '../models/auth.models';

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
}
