import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { BuildingService } from '../../core/services/building.service';
import { CashService } from '../../core/services/cash.service';
import { PaymentService } from '../../core/services/payment.service';
import { ApartmentSummary } from '../../core/models/auth.models';
import { CashBalances } from '../../core/models/cash.models';
import { PaymentHistoryEntry, RegisterPaymentResult } from '../../core/models/payment.models';
import { BottomNav } from '../../shared/bottom-nav/bottom-nav';

const OBLIGATION_STATUS_LABELS = ['Неплатено', 'Частично платено', 'Платено', 'Просрочено'];
const PAYMENT_METHOD_LABELS = ['Ръчно', 'Stripe'];

@Component({
  selector: 'app-payment-management',
  standalone: true,
  imports: [ReactiveFormsModule, DecimalPipe, DatePipe, BottomNav],
  templateUrl: './payment-management.html',
})
export class PaymentManagement implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly buildingService = inject(BuildingService);
  private readonly cashService = inject(CashService);
  private readonly paymentService = inject(PaymentService);

  readonly obligationStatusLabels = OBLIGATION_STATUS_LABELS;
  readonly paymentMethodLabels = PAYMENT_METHOD_LABELS;

  readonly apartments = signal<ApartmentSummary[]>([]);
  readonly apartmentsLoading = signal(true);

  readonly submitting = signal(false);
  readonly submitError = signal<string | null>(null);
  readonly lastResult = signal<RegisterPaymentResult | null>(null);

  readonly historyLoading = signal(false);
  readonly history = signal<PaymentHistoryEntry[]>([]);

  readonly balances = signal<CashBalances | null>(null);
  readonly balancesLoading = signal(true);
  readonly transferOpen = signal(false);
  readonly transferSubmitting = signal(false);
  readonly transferError = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    apartmentId: [0, [Validators.required, Validators.min(1)]],
    amount: [0, [Validators.required, Validators.min(0.01)]],
    paidAt: [new Date().toISOString().slice(0, 10), Validators.required],
    account: ['Cash' as 'Cash' | 'Bank', Validators.required],
    note: [''],
  });

  readonly transferForm = this.fb.nonNullable.group({
    from: ['Cash' as 'Cash' | 'Bank', Validators.required],
    amount: [0, [Validators.required, Validators.min(0.01)]],
    note: [''],
  });

  readonly filterApartmentId = this.fb.nonNullable.control<number | null>(null);
  readonly filterFrom = this.fb.nonNullable.control('');
  readonly filterTo = this.fb.nonNullable.control('');

  ngOnInit(): void {
    this.buildingService.getApartments().subscribe({
      next: (res) => {
        this.apartments.set(res.apartments);
        this.apartmentsLoading.set(false);
      },
      error: () => this.apartmentsLoading.set(false),
    });

    this.loadHistory();
    this.loadBalances();
  }

  back(): void {
    this.router.navigateByUrl('/dashboard');
  }

  private loadBalances(): void {
    this.balancesLoading.set(true);
    this.cashService.getBalances().subscribe({
      next: (balances) => {
        this.balances.set(balances);
        this.balancesLoading.set(false);
      },
      error: () => this.balancesLoading.set(false),
    });
  }

  toggleTransfer(): void {
    this.transferOpen.set(!this.transferOpen());
    this.transferError.set(null);
    if (this.transferOpen()) {
      this.transferForm.reset({ from: 'Cash', amount: 0, note: '' });
    }
  }

  submitTransfer(): void {
    if (this.transferForm.invalid) {
      this.transferForm.markAllAsTouched();
      return;
    }

    const raw = this.transferForm.getRawValue();
    this.transferSubmitting.set(true);
    this.transferError.set(null);

    this.cashService.transfer({ from: raw.from, amount: raw.amount, note: raw.note || null }).subscribe({
      next: () => {
        this.transferSubmitting.set(false);
        this.transferOpen.set(false);
        this.loadBalances();
      },
      error: (err: Error) => {
        this.transferSubmitting.set(false);
        this.transferError.set(err.message);
      },
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();

    this.submitting.set(true);
    this.submitError.set(null);
    this.lastResult.set(null);

    this.paymentService
      .registerPayment({
        apartmentId: raw.apartmentId,
        amount: raw.amount,
        paidAt: raw.paidAt,
        method: 'Manual',
        account: raw.account,
        note: raw.note || null,
      })
      .subscribe({
        next: (result) => {
          this.submitting.set(false);
          this.lastResult.set(result);
          this.form.patchValue({ amount: 0, note: '' });
          this.loadHistory();
          this.loadBalances();
        },
        error: (err: Error) => {
          this.submitting.set(false);
          this.submitError.set(err.message);
        },
      });
  }

  applyFilters(): void {
    this.loadHistory();
  }

  private loadHistory(): void {
    this.historyLoading.set(true);
    this.paymentService
      .getPayments({
        apartmentId: this.filterApartmentId.value,
        from: this.filterFrom.value || null,
        to: this.filterTo.value || null,
      })
      .subscribe({
        next: (entries) => {
          this.history.set(entries);
          this.historyLoading.set(false);
        },
        error: () => this.historyLoading.set(false),
      });
  }
}
