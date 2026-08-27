import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { Observable, Subject, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ChatMessageItem } from '../models/chat.models';
import { SessionService } from './session.service';

@Injectable({ providedIn: 'root' })
export class ChatService {
  private readonly http = inject(HttpClient);
  private readonly session = inject(SessionService);

  private readonly baseUrl = environment.apiUrl;
  private readonly hubUrl = `${environment.apiUrl.replace(/\/api\/?$/, '')}/hubs/chat`;

  private connection: signalR.HubConnection | null = null;

  readonly messageReceived = new Subject<ChatMessageItem>();
  readonly messageDeleted = new Subject<number>();

  getMessages(): Observable<ChatMessageItem[]> {
    return this.http
      .get<ChatMessageItem[]>(`${this.baseUrl}/chat/messages`)
      .pipe(catchError(this.rethrowWithMessage));
  }

  sendMessage(message: string): Observable<ChatMessageItem> {
    return this.http
      .post<ChatMessageItem>(`${this.baseUrl}/chat/messages`, { message })
      .pipe(catchError(this.rethrowWithMessage));
  }

  deleteMessage(id: number): Observable<{ message: string }> {
    return this.http
      .delete<{ message: string }>(`${this.baseUrl}/chat/messages/${id}`)
      .pipe(catchError(this.rethrowWithMessage));
  }

  async connect(): Promise<void> {
    if (this.connection) {
      return;
    }

    const token = this.session.getToken();
    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(this.hubUrl, { accessTokenFactory: () => token ?? '' })
      .withAutomaticReconnect()
      .build();

    this.connection.on('ReceiveMessage', (item: ChatMessageItem) => this.messageReceived.next(item));
    this.connection.on('MessageDeleted', (id: number) => this.messageDeleted.next(id));

    await this.connection.start();
  }

  async disconnect(): Promise<void> {
    if (this.connection) {
      await this.connection.stop();
      this.connection = null;
    }
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
