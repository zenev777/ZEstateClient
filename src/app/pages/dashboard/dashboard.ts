import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { BuildingService } from '../../core/services/building.service';
import { FeeService } from '../../core/services/fee.service';
import { MeetingService } from '../../core/services/meeting.service';
import { ReportService } from '../../core/services/report.service';
import { RepairService } from '../../core/services/repair.service';
import { SessionService } from '../../core/services/session.service';
import { BottomNav } from '../../shared/bottom-nav/bottom-nav';
import { NotificationBell } from '../../shared/notification-bell/notification-bell';
import { JoinRequestSummary, MeResponse } from '../../core/models/auth.models';
import { ObligationSummary } from '../../core/models/fee.models';
import { MeetingSummary } from '../../core/models/meeting.models';
import { FinancialSummary } from '../../core/models/report.models';
import { RepairSummary } from '../../core/models/repair.models';

const OBLIGATION_STATUS_PAID = 2;
const OBLIGATION_STATUS_OVERDUE = 3;
const REPAIR_STATUS_LABELS = ['Планиран', 'В процес', 'Завършен'];
const MAX_DUES_SHOWN = 3;
const MAX_REPAIRS_SHOWN = 3;

function startOfMonth(): string {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, DecimalPipe, DatePipe, BottomNav, NotificationBell],
  templateUrl: './dashboard.html',
})
export class Dashboard implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly buildingService = inject(BuildingService);
  private readonly feeService = inject(FeeService);
  private readonly meetingService = inject(MeetingService);
  private readonly reportService = inject(ReportService);
  private readonly repairService = inject(RepairService);
  private readonly session = inject(SessionService);
  private readonly router = inject(Router);

  readonly managerName = this.session.getName();
  readonly isManager = this.session.hasRole('HouseManager');
  // Matches the backend's PaymentsManagement policy (Cashier/HouseManager/Administrator) -
  // the financial widgets call endpoints gated by that policy, so a plain resident would
  // just get 403s if we tried to show them here.
  readonly canSeeFinancials = this.isManager || this.session.hasRole('Cashier');

  readonly financialSummaryLoading = signal(true);
  readonly financialSummary = signal<FinancialSummary | null>(null);

  readonly duesLoading = signal(true);
  readonly dues = signal<ObligationSummary[]>([]);

  readonly repairsLoading = signal(true);
  readonly repairs = signal<RepairSummary[]>([]);

  readonly upcomingMeetingLoading = signal(true);
  readonly upcomingMeeting = signal<MeetingSummary | null>(null);

  readonly loading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly requests = signal<JoinRequestSummary[]>([]);
  readonly actioningId = signal<number | null>(null);

  readonly meLoading = signal(true);
  readonly me = signal<MeResponse | null>(null);

  ngOnInit(): void {
    if (this.isManager) {
      this.meLoading.set(false);
      this.load();
    } else {
      this.loadMe();
    }

    this.loadDues();
    this.loadUpcomingMeeting();
    if (this.canSeeFinancials) {
      this.loadFinancialSummary();
    }
    if (this.isManager) {
      this.loadRepairs();
    }
  }

  loadMe(): void {
    this.meLoading.set(true);
    this.authService.me().subscribe({
      next: (me) => {
        this.me.set(me);
        this.meLoading.set(false);
      },
      error: () => {
        this.meLoading.set(false);
      },
    });
  }

  load(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.buildingService.getPendingJoinRequests().subscribe({
      next: (requests) => {
        this.requests.set(requests);
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('Неуспешно зареждане на заявките.');
        this.loading.set(false);
      },
    });
  }

  private loadFinancialSummary(): void {
    this.financialSummaryLoading.set(true);
    this.reportService.getSummary(startOfMonth(), new Date().toISOString()).subscribe({
      next: (summary) => {
        this.financialSummary.set(summary);
        this.financialSummaryLoading.set(false);
      },
      error: () => this.financialSummaryLoading.set(false),
    });
  }

  private loadDues(): void {
    this.duesLoading.set(true);
    this.feeService.getMyObligations().subscribe({
      next: (obligations) => {
        const outstanding = obligations
          .filter((o) => o.status !== OBLIGATION_STATUS_PAID)
          .sort((a, b) => (a.dueDate ?? '').localeCompare(b.dueDate ?? ''))
          .slice(0, MAX_DUES_SHOWN);
        this.dues.set(outstanding);
        this.duesLoading.set(false);
      },
      error: () => this.duesLoading.set(false),
    });
  }

  private loadRepairs(): void {
    this.repairsLoading.set(true);
    this.repairService.getRepairs().subscribe({
      next: (repairs) => {
        this.repairs.set(repairs.slice(0, MAX_REPAIRS_SHOWN));
        this.repairsLoading.set(false);
      },
      error: () => this.repairsLoading.set(false),
    });
  }

  private loadUpcomingMeeting(): void {
    this.upcomingMeetingLoading.set(true);
    this.meetingService.getMeetings().subscribe({
      next: (meetings) => {
        const now = new Date().toISOString();
        const next = meetings
          .filter((m) => m.startDate >= now)
          .sort((a, b) => a.startDate.localeCompare(b.startDate))[0];
        this.upcomingMeeting.set(next ?? null);
        this.upcomingMeetingLoading.set(false);
      },
      error: () => this.upcomingMeetingLoading.set(false),
    });
  }

  isOverdue(due: ObligationSummary): boolean {
    return due.status === OBLIGATION_STATUS_OVERDUE;
  }

  repairStatusLabel(status: number): string {
    return REPAIR_STATUS_LABELS[status] ?? 'Неизвестен';
  }

  roleLabel(role: number): string {
    return role === 0 ? 'Собственик' : 'Живущ';
  }

  approve(id: number): void {
    this.actioningId.set(id);
    this.buildingService.approve(id).subscribe({
      next: () => this.removeRequest(id),
      error: () => this.actioningId.set(null),
    });
  }

  reject(id: number): void {
    const reason = prompt('Причина за отхвърляне (по избор):');
    if (reason === null) {
      return;
    }

    this.actioningId.set(id);
    this.buildingService.reject(id, reason.trim()).subscribe({
      next: () => this.removeRequest(id),
      error: () => this.actioningId.set(null),
    });
  }

  logout(): void {
    this.session.clear();
    this.router.navigateByUrl('/');
  }

  private removeRequest(id: number): void {
    this.requests.update((list) => list.filter((r) => r.id !== id));
    this.actioningId.set(null);
  }
}
