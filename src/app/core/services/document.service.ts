import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { rethrowWithMessage } from '../utils/http-error.util';
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
      .pipe(catchError(rethrowWithMessage));
  }

  upload(file: File, type: DocumentTypeName, access: DocumentAccessName): Observable<DocumentItem> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    formData.append('access', access);

    return this.http
      .post<DocumentItem>(`${this.baseUrl}/documents`, formData)
      .pipe(catchError(rethrowWithMessage));
  }

  delete(id: number): Observable<{ message: string }> {
    return this.http
      .delete<{ message: string }>(`${this.baseUrl}/documents/${id}`)
      .pipe(catchError(rethrowWithMessage));
  }

  download(id: number): Observable<Blob> {
    return this.http
      .get(`${this.baseUrl}/documents/${id}/download`, { responseType: 'blob' })
      .pipe(catchError(rethrowWithMessage));
  }
}
