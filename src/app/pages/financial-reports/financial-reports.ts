import { DecimalPipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ReportService } from '../../core/services/report.service';
import { BalanceHistoryPoint, FinancialSummary } from '../../core/models/report.models';
import { BottomNav } from '../../shared/bottom-nav/bottom-nav';

const FEE_TYPE_LABELS = ['Фиксирана сума', 'По идеални части', 'Ремонт'];

function firstOfMonth(): string {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

@Component({
  selector: 'app-financial-reports',
  standalone: true,
  imports: [ReactiveFormsModule, DecimalPipe, BottomNav],
  templateUrl: './financial-reports.html',
})
export class FinancialReports implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly reportService = inject(ReportService);

  readonly feeTypeLabels = FEE_TYPE_LABELS;

  readonly filterForm = this.fb.nonNullable.group({
    from: [firstOfMonth(), Validators.required],
    to: [today(), Validators.required],
  });

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly summary = signal<FinancialSummary | null>(null);
  readonly exporting = signal(false);

  readonly history = signal<BalanceHistoryPoint[]>([]);
  readonly chartBars = computed(() => {
    const points = this.history();
    const maxAbs = Math.max(1, ...points.map((p) => Math.abs(p.balance)));
    return points.map((p) => ({
      period: p.period.slice(5),
      balance: p.balance,
      heightPct: (Math.abs(p.balance) / maxAbs) * 100,
      positive: p.balance >= 0,
    }));
  });

  ngOnInit(): void {
    this.loadSummary();
    this.reportService.getBalanceHistory(12).subscribe({
      next: (points) => this.history.set(points),
      error: () => {},
    });
  }

  back(): void {
    this.router.navigateByUrl('/dashboard');
  }

  loadSummary(): void {
    if (this.filterForm.invalid) {
      return;
    }

    const { from, to } = this.filterForm.getRawValue();
    this.loading.set(true);
    this.error.set(null);

    this.reportService.getSummary(from, to).subscribe({
      next: (summary) => {
        this.summary.set(summary);
        this.loading.set(false);
      },
      error: (err: Error) => {
        this.error.set(err.message);
        this.loading.set(false);
      },
    });
  }

  exportCsv(): void {
    const { from, to } = this.filterForm.getRawValue();
    this.exporting.set(true);

    this.reportService.exportCsv(from, to).subscribe({
      next: (blob) => {
        this.exporting.set(false);
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `financial-report_${from}_${to}.csv`;
        link.click();
        URL.revokeObjectURL(url);
      },
      error: () => this.exporting.set(false),
    });
  }
}
