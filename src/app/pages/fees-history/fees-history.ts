import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FeeService } from '../../core/services/fee.service';
import { BottomNav } from '../../shared/bottom-nav/bottom-nav';
import { ObligationSummary } from '../../core/models/fee.models';

const OBLIGATION_STATUS_PAID = 2;

@Component({
  selector: 'app-fees-history',
  standalone: true,
  imports: [DecimalPipe, DatePipe, BottomNav],
  templateUrl: './fees-history.html',
})
export class FeesHistory implements OnInit {
  private readonly router = inject(Router);
  private readonly feeService = inject(FeeService);

  readonly loading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly obligations = signal<ObligationSummary[]>([]);

  get dueTotal(): number {
    return this.obligations()
      .filter((o) => o.status !== OBLIGATION_STATUS_PAID)
      .reduce((sum, o) => sum + o.amount, 0);
  }

  get paidTotal(): number {
    return this.obligations()
      .filter((o) => o.status === OBLIGATION_STATUS_PAID)
      .reduce((sum, o) => sum + o.amount, 0);
  }

  isPaid(o: ObligationSummary): boolean {
    return o.status === OBLIGATION_STATUS_PAID;
  }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.errorMessage.set(null);
    this.feeService.getMyObligations().subscribe({
      next: (obligations) => {
        this.obligations.set(obligations);
        this.loading.set(false);
      },
      error: (err: Error) => {
        this.errorMessage.set(err.message);
        this.loading.set(false);
      },
    });
  }

  back(): void {
    this.router.navigateByUrl('/dashboard');
  }
}
