import { DecimalPipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { BuildingService } from '../../core/services/building.service';
import { SessionService } from '../../core/services/session.service';
import { JoinRequestSummary, MeResponse } from '../../core/models/auth.models';

interface MockRepair {
  title: string;
  status: 'Planned' | 'InProgress';
}

interface MockMeeting {
  title: string;
  date: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, DecimalPipe],
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
  readonly bankBalance = 3240.5;
  readonly cashBalance = 180;
  readonly dueAmount = 45;
  readonly duePeriod = 'юли 2026';

  readonly repairs: MockRepair[] = [
    { title: 'Смяна на асансьорен мотор', status: 'InProgress' },
    { title: 'Пребоядисване на стълбище', status: 'Planned' },
  ];

  readonly meetings: MockMeeting[] = [{ title: 'Годишно общо събрание', date: '15 август 2026, 18:00' }];

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
    this.actioningId.set(id);
    this.buildingService.reject(id).subscribe({
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
