import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { BuildingService } from '../../core/services/building.service';
import { BuildingRegisterEntry } from '../../core/models/building-register.models';
import { BottomNav } from '../../shared/bottom-nav/bottom-nav';

const ROLE_LABELS = ['Собственик', 'Живущ', 'Домоуправител'];

@Component({
  selector: 'app-building-register',
  standalone: true,
  imports: [DecimalPipe, DatePipe, BottomNav],
  templateUrl: './building-register.html',
})
export class BuildingRegister implements OnInit {
  private readonly router = inject(Router);
  private readonly buildingService = inject(BuildingService);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly entries = signal<BuildingRegisterEntry[]>([]);
  readonly exporting = signal(false);

  ngOnInit(): void {
    this.load();
  }

  back(): void {
    this.router.navigateByUrl('/dashboard');
  }

  roleLabel(role: number): string {
    return ROLE_LABELS[role] ?? 'Живущ';
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.buildingService.getRegister().subscribe({
      next: (entries) => {
        this.entries.set(entries);
        this.loading.set(false);
      },
      error: (err: Error) => {
        this.error.set(err.message);
        this.loading.set(false);
      },
    });
  }

  exportCsv(): void {
    this.exporting.set(true);
    this.buildingService.exportRegister().subscribe({
      next: (blob) => {
        this.exporting.set(false);
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `building-register_${new Date().toISOString().slice(0, 10)}.csv`;
        link.click();
        URL.revokeObjectURL(url);
      },
      error: () => this.exporting.set(false),
    });
  }
}
