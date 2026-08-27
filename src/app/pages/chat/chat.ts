import { DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ChatService } from '../../core/services/chat.service';
import { SessionService } from '../../core/services/session.service';
import { ChatMessageItem } from '../../core/models/chat.models';
import { BottomNav } from '../../shared/bottom-nav/bottom-nav';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [ReactiveFormsModule, DatePipe, BottomNav],
  templateUrl: './chat.html',
})
export class Chat implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly chatService = inject(ChatService);
  private readonly session = inject(SessionService);
  private readonly subscriptions = new Subscription();

  readonly isManager = this.session.hasRole('HouseManager');
  readonly currentUserName = this.session.getName();

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly messages = signal<ChatMessageItem[]>([]);
  readonly sending = signal(false);

  readonly messageControl = this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(1000)]);

  ngOnInit(): void {
    this.chatService.getMessages().subscribe({
      next: (messages) => {
        this.messages.set(messages);
        this.loading.set(false);
      },
      error: (err: Error) => {
        this.error.set(err.message);
        this.loading.set(false);
      },
    });

    this.subscriptions.add(
      this.chatService.messageReceived.subscribe((item) => {
        if (!this.messages().some((m) => m.id === item.id)) {
          this.messages.update((list) => [...list, item]);
        }
      }),
    );

    this.subscriptions.add(
      this.chatService.messageDeleted.subscribe((id) => {
        this.messages.update((list) => list.filter((m) => m.id !== id));
      }),
    );

    this.chatService.connect().catch(() => this.error.set('Неуспешна връзка за съобщения в реално време.'));
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this.chatService.disconnect();
  }

  back(): void {
    this.router.navigateByUrl('/dashboard');
  }

  send(): void {
    if (this.messageControl.invalid) {
      this.messageControl.markAsTouched();
      return;
    }

    const text = this.messageControl.value.trim();
    if (!text) {
      return;
    }

    this.sending.set(true);
    this.chatService.sendMessage(text).subscribe({
      next: () => {
        this.sending.set(false);
        this.messageControl.reset('');
      },
      error: (err: Error) => {
        this.sending.set(false);
        this.error.set(err.message);
      },
    });
  }

  deleteMessage(item: ChatMessageItem): void {
    if (!confirm('Да изтрия ли това съобщение?')) {
      return;
    }

    this.chatService.deleteMessage(item.id).subscribe({
      error: (err: Error) => this.error.set(err.message),
    });
  }
}
