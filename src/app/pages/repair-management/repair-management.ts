import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { RepairService } from '../../core/services/repair.service';
import { RepairDocument, RepairSummary } from '../../core/models/repair.models';
import { BottomNav } from '../../shared/bottom-nav/bottom-nav';

const REPAIR_STATUS_LABELS = ['Планиран', 'В процес', 'Завършен'];

@Component({
  selector: 'app-repair-management',
  standalone: true,
  imports: [ReactiveFormsModule, DecimalPipe, DatePipe, BottomNav],
  templateUrl: './repair-management.html',
})
export class RepairManagement implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly repairService = inject(RepairService);

  readonly statusLabels = REPAIR_STATUS_LABELS;

  readonly repairsLoading = signal(true);
  readonly repairs = signal<RepairSummary[]>([]);
  readonly repairsError = signal<string | null>(null);

  readonly formOpen = signal(false);
  readonly editingId = signal<number | null>(null);
  readonly formSubmitting = signal(false);
  readonly formError = signal<string | null>(null);
  readonly deletingId = signal<number | null>(null);
  readonly allocatingId = signal<number | null>(null);

  readonly expandedId = signal<number | null>(null);
  readonly documentsByRepairId = signal<Record<number, RepairDocument[]>>({});
  readonly uploadingId = signal<number | null>(null);

  readonly createForm = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(150)]],
    description: [''],
    budget: [0, [Validators.required, Validators.min(0.01)]],
  });

  readonly editForm = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(150)]],
    description: [''],
    budget: [0, [Validators.required, Validators.min(0.01)]],
    actualCost: this.fb.control<number | null>(null),
    status: ['Planned' as 'Planned' | 'InProgress' | 'Completed', Validators.required],
  });

  ngOnInit(): void {
    this.loadRepairs();
  }

  back(): void {
    this.router.navigateByUrl('/dashboard');
  }

  loadRepairs(): void {
    this.repairsLoading.set(true);
    this.repairsError.set(null);
    this.repairService.getRepairs().subscribe({
      next: (repairs) => {
        this.repairs.set(repairs);
        this.repairsLoading.set(false);
      },
      error: (err: Error) => {
        this.repairsError.set(err.message);
        this.repairsLoading.set(false);
      },
    });
  }

  startCreate(): void {
    this.editingId.set(null);
    this.createForm.reset({ title: '', description: '', budget: 0 });
    this.formError.set(null);
    this.formOpen.set(true);
  }

  cancelCreate(): void {
    this.formOpen.set(false);
    this.formError.set(null);
  }

  submitCreate(): void {
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      return;
    }

    const raw = this.createForm.getRawValue();
    this.formSubmitting.set(true);
    this.formError.set(null);

    this.repairService
      .createRepair({ ...raw, description: raw.description || null })
      .subscribe({
        next: () => {
          this.formSubmitting.set(false);
          this.formOpen.set(false);
          this.loadRepairs();
        },
        error: (err: Error) => {
          this.formSubmitting.set(false);
          this.formError.set(err.message);
        },
      });
  }

  startEdit(repair: RepairSummary): void {
    this.editingId.set(repair.id);
    this.editForm.reset({
      title: repair.title,
      description: repair.description ?? '',
      budget: repair.budget,
      actualCost: repair.actualCost,
      status: (['Planned', 'InProgress', 'Completed'] as const)[repair.status] ?? 'Planned',
    });
    this.formError.set(null);
  }

  cancelEdit(): void {
    this.editingId.set(null);
    this.formError.set(null);
  }

  submitEdit(): void {
    const id = this.editingId();
    if (id == null || this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }

    const raw = this.editForm.getRawValue();
    this.formSubmitting.set(true);
    this.formError.set(null);

    this.repairService
      .updateRepair(id, { ...raw, description: raw.description || null })
      .subscribe({
        next: () => {
          this.formSubmitting.set(false);
          this.editingId.set(null);
          this.loadRepairs();
        },
        error: (err: Error) => {
          this.formSubmitting.set(false);
          this.formError.set(err.message);
        },
      });
  }

  deleteRepair(repair: RepairSummary): void {
    if (!confirm(`Да изтрия ли ремонта "${repair.title}"?`)) {
      return;
    }

    this.deletingId.set(repair.id);
    this.repairsError.set(null);

    this.repairService.deleteRepair(repair.id).subscribe({
      next: () => {
        this.deletingId.set(null);
        this.loadRepairs();
      },
      error: (err: Error) => {
        this.deletingId.set(null);
        this.repairsError.set(err.message);
      },
    });
  }

  allocateCosts(repair: RepairSummary): void {
    if (!confirm(`Разходите (${repair.actualCost ?? repair.budget} €) ще се разпределят пропорционално по идеални части и не могат да се отменят. Продължи?`)) {
      return;
    }

    this.allocatingId.set(repair.id);
    this.repairsError.set(null);

    this.repairService.allocateCosts(repair.id).subscribe({
      next: () => {
        this.allocatingId.set(null);
        this.loadRepairs();
      },
      error: (err: Error) => {
        this.allocatingId.set(null);
        this.repairsError.set(err.message);
      },
    });
  }

  toggleDocuments(repair: RepairSummary): void {
    if (this.expandedId() === repair.id) {
      this.expandedId.set(null);
      return;
    }

    this.expandedId.set(repair.id);
    if (!this.documentsByRepairId()[repair.id]) {
      this.repairService.getDocuments(repair.id).subscribe({
        next: (docs) => this.documentsByRepairId.update((map) => ({ ...map, [repair.id]: docs })),
        error: () => {},
      });
    }
  }

  documentsFor(repairId: number): RepairDocument[] {
    return this.documentsByRepairId()[repairId] ?? [];
  }

  uploadDocument(repair: RepairSummary, event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }

    this.uploadingId.set(repair.id);
    this.repairService.uploadDocument(repair.id, file).subscribe({
      next: () => {
        this.uploadingId.set(null);
        input.value = '';
        this.repairService.getDocuments(repair.id).subscribe((docs) =>
          this.documentsByRepairId.update((map) => ({ ...map, [repair.id]: docs })),
        );
      },
      error: () => {
        this.uploadingId.set(null);
        input.value = '';
      },
    });
  }

  downloadDocument(doc: RepairDocument): void {
    this.repairService.downloadDocument(doc.id).subscribe((blob) => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = doc.fileName;
      link.click();
      URL.revokeObjectURL(url);
    });
  }
}
