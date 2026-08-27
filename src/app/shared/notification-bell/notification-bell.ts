import { DatePipe } from '@angular/common';
import { Component, ElementRef, HostListener, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { NotificationItem } from '../../core/models/notification.models';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-notification-bell',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './notification-bell.html',
})
export class NotificationBell implements OnInit {
  private readonly notificationService = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly host = inject(ElementRef<HTMLElement>);

  readonly open = signal(false);
  readonly unreadCount = signal(0);
  readonly notifications = signal<NotificationItem[]>([]);
  readonly loading = signal(false);
  readonly emailEnabled = signal(true);

  ngOnInit(): void {
    this.refreshUnreadCount();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.open() && !this.host.nativeElement.contains(event.target as Node)) {
      this.open.set(false);
    }
  }

  toggle(): void {
    this.open.set(!this.open());
    if (this.open()) {
      this.loadNotifications();
      this.notificationService.getPreferences().subscribe({
        next: (prefs) => this.emailEnabled.set(prefs.emailEnabled),
        error: () => {},
      });
    }
  }

  loadNotifications(): void {
    this.loading.set(true);
    this.notificationService.list().subscribe({
      next: (items) => {
        this.notifications.set(items);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  refreshUnreadCount(): void {
    this.notificationService.unreadCount().subscribe({
      next: (res) => this.unreadCount.set(res.count),
      error: () => {},
    });
  }

  openNotification(item: NotificationItem): void {
    if (!item.isRead) {
      this.notificationService.markAsRead(item.id).subscribe({
        next: () => {
          this.notifications.update((list) =>
            list.map((n) => (n.id === item.id ? { ...n, isRead: true } : n)),
          );
          this.refreshUnreadCount();
        },
      });
    }

    this.open.set(false);
    if (item.link) {
      this.router.navigateByUrl(item.link);
    }
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        this.notifications.update((list) => list.map((n) => ({ ...n, isRead: true })));
        this.unreadCount.set(0);
      },
    });
  }

  toggleEmailPreference(): void {
    const next = !this.emailEnabled();
    this.emailEnabled.set(next);
    this.notificationService.updatePreferences({ emailEnabled: next }).subscribe({
      error: () => this.emailEnabled.set(!next),
    });
  }
}
