import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  MeetingFormRequest,
  MeetingMinutes,
  MeetingSummary,
  MeetingUpdateRequest,
} from '../models/meeting.models';

@Injectable({ providedIn: 'root' })
export class MeetingService {
  private readonly baseUrl = environment.apiUrl;

  constructor(private readonly http: HttpClient) {}

  getMeetings(): Observable<MeetingSummary[]> {
    return this.http
      .get<MeetingSummary[]>(`${this.baseUrl}/meetings`)
      .pipe(catchError(this.rethrowWithMessage));
  }

  createMeeting(request: MeetingFormRequest): Observable<MeetingSummary> {
    return this.http
      .post<MeetingSummary>(`${this.baseUrl}/meetings`, request)
      .pipe(catchError(this.rethrowWithMessage));
  }

  updateMeeting(id: number, request: MeetingUpdateRequest): Observable<MeetingSummary> {
    return this.http
      .put<MeetingSummary>(`${this.baseUrl}/meetings/${id}`, request)
      .pipe(catchError(this.rethrowWithMessage));
  }

  deleteMeeting(id: number): Observable<{ message: string }> {
    return this.http
      .delete<{ message: string }>(`${this.baseUrl}/meetings/${id}`)
      .pipe(catchError(this.rethrowWithMessage));
  }

  generateMeetLink(): Observable<{ meetUrl: string }> {
    return this.http
      .post<{ meetUrl: string }>(`${this.baseUrl}/meetings/generate-meet-link`, {})
      .pipe(catchError(this.rethrowWithMessage));
  }

  uploadMinutes(meetingId: number, file: File): Observable<MeetingMinutes> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http
      .post<MeetingMinutes>(`${this.baseUrl}/meetings/${meetingId}/minutes`, formData)
      .pipe(catchError(this.rethrowWithMessage));
  }

  getMinutes(meetingId: number): Observable<MeetingMinutes[]> {
    return this.http
      .get<MeetingMinutes[]>(`${this.baseUrl}/meetings/${meetingId}/minutes`)
      .pipe(catchError(this.rethrowWithMessage));
  }

  downloadDocument(documentId: number): Observable<Blob> {
    return this.http
      .get(`${this.baseUrl}/documents/${documentId}/download`, { responseType: 'blob' })
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
