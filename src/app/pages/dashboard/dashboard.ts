import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { BuildingService } from '../../core/services/building.service';
import { SessionService } from '../../core/services/session.service';
import { JoinRequestSummary } from '../../core/models/auth.models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './dashboard.html',
})
export class Dashboard implements OnInit {
  private readonly buildingService = inject(BuildingService);
  private readonly session = inject(SessionService);
  private readonly router = inject(Router);

  readonly managerName = this.session.getName();
  readonly loading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly requests = signal<JoinRequestSummary[]>([]);
  readonly actioningId = signal<number | null>(null);

  ngOnInit(): void {
    this.load();
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
