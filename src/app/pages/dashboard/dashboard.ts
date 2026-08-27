import { DecimalPipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { BuildingService } from '../../core/services/building.service';
import { SessionService } from '../../core/services/session.service';
import { BottomNav } from '../../shared/bottom-nav/bottom-nav';
import { JoinRequestSummary, MeResponse } from '../../core/models/auth.models';

interface MockRepair {
  title: string;
  status: 'Planned' | 'InProgress';
  progress: number;
}

interface MockMeeting {
  title: string;
  date: string;
}

interface MockDue {
  title: string;
  amount: number;
  dueDate: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, DecimalPipe, BottomNav],
  templateUrl: './dashboard.html',
})
export class Dashboard implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly buildingService = inject(BuildingService);
  private readonly session = inject(SessionService);
  private readonly router = inject(Router);

  readonly managerName = this.session.getName();
  readonly isManager = this.session.hasRole('HouseManager');

  // Mocked — no balances/repairs/meetings API yet.
  readonly bankBalance = 4820.55;
  readonly cashBalance = 312.4;
  readonly monthlyIncome = 1240;
  readonly monthlyExpense = 685;

  readonly dues: MockDue[] = [
    { title: 'Месечна вноска — Ноември', amount: 42, dueDate: 'до 30 ноем.' },
    { title: 'Фонд Ремонт', amount: 15, dueDate: 'до 05 дек.' },
  ];

  readonly repairs: MockRepair[] = [
    { title: 'Ремонт на асансьор', status: 'InProgress', progress: 60 },
    { title: 'Боядисване на входа', status: 'Planned', progress: 10 },
  ];

  readonly meetings: MockMeeting[] = [{ title: 'Общо събрание', date: 'Пет, 29 ноем. · 19:00' }];

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

  repairStatusLabel(status: MockRepair['status']): string {
    return status === 'InProgress' ? 'В процес' : 'Планиран';
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
