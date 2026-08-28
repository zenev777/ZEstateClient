import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { Observable, Subject, catchError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { rethrowWithMessage } from '../utils/http-error.util';
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

  getMessages(): Observable<ChatMessageItem[]> {
    return this.http
      .get<ChatMessageItem[]>(`${this.baseUrl}/chat/messages`)
      .pipe(catchError(rethrowWithMessage));
  }

  sendMessage(message: string): Observable<ChatMessageItem> {
    return this.http
      .post<ChatMessageItem>(`${this.baseUrl}/chat/messages`, { message })
      .pipe(catchError(rethrowWithMessage));
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

    await this.connection.start();
  }

  async disconnect(): Promise<void> {
    if (this.connection) {
      await this.connection.stop();
      this.connection = null;
    }
  }
}
