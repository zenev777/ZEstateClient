import { DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ChatService } from '../../core/services/chat.service';
import { SessionService } from '../../core/services/session.service';
import { ChatMessageItem } from '../../core/models/chat.models';
import { BottomNav } from '../../shared/bottom-nav/bottom-nav';

const ROLE_LABELS: Record<string, string> = {
  HouseManager: 'Домоуправител',
  Cashier: 'Касиер',
  Administrator: 'Администратор',
  Resident: 'Живущ',
};

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

  readonly currentUserName = this.session.getName();

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly messages = signal<ChatMessageItem[]>([]);
  readonly sending = signal(false);

  readonly messageControl = this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(1000)]);
  // Wrapping the control in a FormGroup gives the <form> a [formGroup] directive,
  // which is what actually provides the (ngSubmit) output under ReactiveFormsModule -
  // without it, submit falls through to the browser's native (page-reloading) submit.
  readonly form = this.fb.group({ message: this.messageControl });

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

    this.chatService.connect().catch(() => this.error.set('Неуспешна връзка за съобщения в реално време.'));
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this.chatService.disconnect();
  }

  back(): void {
    this.router.navigateByUrl('/dashboard');
  }

  isMine(item: ChatMessageItem): boolean {
    return item.senderName === this.currentUserName;
  }

  roleLabel(role: string): string {
    return ROLE_LABELS[role] ?? role;
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
      next: (sent) => {
        this.sending.set(false);
        this.messageControl.reset('');
        // Append directly instead of relying solely on the SignalR echo - if the hub
        // connection silently failed, the sender would otherwise never see their own
        // message even though it was saved. messageReceived's own dedupe-by-id guard
        // means this can't double up if the hub delivers the same message afterward.
        if (!this.messages().some((m) => m.id === sent.id)) {
          this.messages.update((list) => [...list, sent]);
        }
      },
      error: (err: Error) => {
        this.sending.set(false);
        this.error.set(err.message);
      },
    });
  }
}
