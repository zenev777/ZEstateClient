import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { NotificationItem, NotificationPreferences } from '../models/notification.models';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly baseUrl = environment.apiUrl;

  constructor(private readonly http: HttpClient) {}

  list(): Observable<NotificationItem[]> {
    return this.http.get<NotificationItem[]>(`${this.baseUrl}/notifications`);
  }

  unreadCount(): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${this.baseUrl}/notifications/unread-count`);
  }

  markAsRead(id: number): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.baseUrl}/notifications/${id}/read`, {});
  }

  markAllAsRead(): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.baseUrl}/notifications/read-all`, {});
  }

  getPreferences(): Observable<NotificationPreferences> {
    return this.http.get<NotificationPreferences>(`${this.baseUrl}/notifications/preferences`);
  }

  updatePreferences(preferences: NotificationPreferences): Observable<NotificationPreferences> {
    return this.http.put<NotificationPreferences>(`${this.baseUrl}/notifications/preferences`, preferences);
  }
}
