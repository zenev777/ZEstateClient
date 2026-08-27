import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { FeeService } from '../../core/services/fee.service';
import { FeeSummary, ObligationSummary } from '../../core/models/fee.models';
import { BottomNav } from '../../shared/bottom-nav/bottom-nav';

const FEE_TYPE_LABELS = ['Фиксирана сума', 'По идеални части'];
const FEE_FREQUENCY_LABELS = ['Еднократна', 'Месечна'];
const FEE_PRIORITY_LABELS = ['Нисък', 'Нормален', 'Висок', 'Спешен'];
const OBLIGATION_STATUS_LABELS = ['Неплатено', 'Частично платено', 'Платено', 'Просрочено'];

@Component({
  selector: 'app-fee-management',
  standalone: true,
  imports: [ReactiveFormsModule, DecimalPipe, DatePipe, BottomNav],
  templateUrl: './fee-management.html',
})
export class FeeManagement implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly feeService = inject(FeeService);

  readonly feeTypeLabels = FEE_TYPE_LABELS;
  readonly feeFrequencyLabels = FEE_FREQUENCY_LABELS;
  readonly feePriorityLabels = FEE_PRIORITY_LABELS;
  readonly obligationStatusLabels = OBLIGATION_STATUS_LABELS;

  readonly feesLoading = signal(true);
  readonly fees = signal<FeeSummary[]>([]);
  readonly feesError = signal<string | null>(null);

  readonly formOpen = signal(false);
  readonly editingId = signal<number | null>(null);
  readonly formSubmitting = signal(false);
  readonly formError = signal<string | null>(null);
  readonly deletingId = signal<number | null>(null);

  readonly generating = signal(false);
  readonly generateResult = signal<string | null>(null);

  readonly obligationsOpen = signal(false);
  readonly obligationsLoading = signal(false);
  readonly obligations = signal<ObligationSummary[]>([]);

  readonly feeForm = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(150)]],
    description: [''],
    amount: [0, [Validators.required, Validators.min(0.01)]],
    type: ['Fixed' as 'Fixed' | 'PerIdealPart', Validators.required],
    frequency: ['Monthly' as 'OneTime' | 'Monthly', Validators.required],
    dateFrom: [new Date().toISOString().slice(0, 10), Validators.required],
    dateTo: [''],
    priority: ['Normal' as 'Low' | 'Normal' | 'High' | 'Urgent', Validators.required],
  });

  ngOnInit(): void {
    this.loadFees();
  }

  back(): void {
    this.router.navigateByUrl('/dashboard');
  }

  loadFees(): void {
    this.feesLoading.set(true);
    this.feesError.set(null);
    this.feeService.getFees().subscribe({
      next: (fees) => {
        this.fees.set(fees);
        this.feesLoading.set(false);
      },
      error: (err: Error) => {
        this.feesError.set(err.message);
        this.feesLoading.set(false);
      },
    });
  }

  startCreate(): void {
    this.editingId.set(null);
    this.feeForm.reset({
      title: '',
      description: '',
      amount: 0,
      type: 'Fixed',
      frequency: 'Monthly',
      dateFrom: new Date().toISOString().slice(0, 10),
      dateTo: '',
      priority: 'Normal',
    });
    this.formError.set(null);
    this.formOpen.set(true);
  }

  startEdit(fee: FeeSummary): void {
    this.editingId.set(fee.id);
    this.feeForm.reset({
      title: fee.title,
      description: fee.description ?? '',
      amount: fee.amount,
      type: fee.type === 1 ? 'PerIdealPart' : 'Fixed',
      frequency: fee.frequency === 0 ? 'OneTime' : 'Monthly',
      dateFrom: fee.dateFrom.slice(0, 10),
      dateTo: fee.dateTo ? fee.dateTo.slice(0, 10) : '',
      priority: (['Low', 'Normal', 'High', 'Urgent'] as const)[fee.priority] ?? 'Normal',
    });
    this.formError.set(null);
    this.formOpen.set(true);
  }

  cancelForm(): void {
    this.formOpen.set(false);
    this.editingId.set(null);
    this.formError.set(null);
  }

  submitFee(): void {
    if (this.feeForm.invalid) {
      this.feeForm.markAllAsTouched();
      return;
    }

    const raw = this.feeForm.getRawValue();
    const request = {
      ...raw,
      description: raw.description || null,
      dateTo: raw.dateTo || null,
    };

    this.formSubmitting.set(true);
    this.formError.set(null);

    const editingId = this.editingId();
    const call = editingId ? this.feeService.updateFee(editingId, request) : this.feeService.createFee(request);

    call.subscribe({
      next: () => {
        this.formSubmitting.set(false);
        this.formOpen.set(false);
        this.editingId.set(null);
        this.loadFees();
      },
      error: (err: Error) => {
        this.formSubmitting.set(false);
        this.formError.set(err.message);
      },
    });
  }

  deleteFee(fee: FeeSummary): void {
    if (!confirm(`Да изтрия ли таксата "${fee.title}"?`)) {
      return;
    }

    this.deletingId.set(fee.id);
    this.feesError.set(null);

    this.feeService.deleteFee(fee.id).subscribe({
      next: () => {
        this.deletingId.set(null);
        this.loadFees();
      },
      error: (err: Error) => {
        this.deletingId.set(null);
        this.feesError.set(err.message);
      },
    });
  }

  generateObligations(): void {
    this.generating.set(true);
    this.generateResult.set(null);

    this.feeService.generateObligations().subscribe({
      next: (result) => {
        this.generating.set(false);
        this.generateResult.set(
          `Генерирани: ${result.created}, вече съществуваха: ${result.skippedExisting}.`,
        );
        if (this.obligationsOpen()) {
          this.loadObligations();
        }
      },
      error: (err: Error) => {
        this.generating.set(false);
        this.generateResult.set(err.message);
      },
    });
  }

  toggleObligations(): void {
    this.obligationsOpen.set(!this.obligationsOpen());
    if (this.obligationsOpen()) {
      this.loadObligations();
    }
  }

  private loadObligations(): void {
    this.obligationsLoading.set(true);
    this.feeService.getObligations().subscribe({
      next: (items) => {
        this.obligations.set(items);
        this.obligationsLoading.set(false);
      },
      error: () => this.obligationsLoading.set(false),
    });
  }
}
