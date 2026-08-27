import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DocumentAccessName, DocumentItem, DocumentTypeName } from '../models/document.models';

@Injectable({ providedIn: 'root' })
export class DocumentService {
  private readonly baseUrl = environment.apiUrl;

  constructor(private readonly http: HttpClient) {}

  getDocuments(filter: { type?: string | null; from?: string | null; to?: string | null }): Observable<DocumentItem[]> {
    let params = new HttpParams();
    if (filter.type) params = params.set('type', filter.type);
    if (filter.from) params = params.set('from', filter.from);
    if (filter.to) params = params.set('to', filter.to);

    return this.http
      .get<DocumentItem[]>(`${this.baseUrl}/documents`, { params })
      .pipe(catchError(this.rethrowWithMessage));
  }

  upload(file: File, type: DocumentTypeName, access: DocumentAccessName): Observable<DocumentItem> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    formData.append('access', access);

    return this.http
      .post<DocumentItem>(`${this.baseUrl}/documents`, formData)
      .pipe(catchError(this.rethrowWithMessage));
  }

  delete(id: number): Observable<{ message: string }> {
    return this.http
      .delete<{ message: string }>(`${this.baseUrl}/documents/${id}`)
      .pipe(catchError(this.rethrowWithMessage));
  }

  download(id: number): Observable<Blob> {
    return this.http
      .get(`${this.baseUrl}/documents/${id}/download`, { responseType: 'blob' })
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
