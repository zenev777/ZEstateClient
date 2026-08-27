import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { BuildingService } from '../../core/services/building.service';
import { ApartmentSummary, BuildingSummary, InviteCodeLogEntry } from '../../core/models/auth.models';
import { ApartmentTransferRecord } from '../../core/models/apartment-transfer.models';
import { BottomNav } from '../../shared/bottom-nav/bottom-nav';

@Component({
  selector: 'app-building-management',
  standalone: true,
  imports: [ReactiveFormsModule, DecimalPipe, DatePipe, BottomNav],
  templateUrl: './building-management.html',
})
export class BuildingManagement implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly buildingService = inject(BuildingService);

  readonly buildingLoading = signal(true);
  readonly buildingSaving = signal(false);
  readonly buildingError = signal<string | null>(null);
  readonly buildingSaved = signal(false);
  readonly building = signal<BuildingSummary | null>(null);

  readonly inviteActionLoading = signal(false);
  readonly inviteActionError = signal<string | null>(null);

  readonly limitsForm = this.fb.nonNullable.group({
    expiresAt: [''],
    maxUses: this.fb.control<number | null>(null),
  });

  readonly logOpen = signal(false);
  readonly logLoading = signal(false);
  readonly log = signal<InviteCodeLogEntry[]>([]);

  readonly quorumSaving = signal(false);
  readonly quorumControl = this.fb.nonNullable.control(50);

  readonly apartmentsLoading = signal(true);
  readonly apartments = signal<ApartmentSummary[]>([]);
  readonly idealPartsTotal = signal(0);
  readonly apartmentsError = signal<string | null>(null);

  readonly formOpen = signal(false);
  readonly editingId = signal<number | null>(null);
  readonly formSubmitting = signal(false);
  readonly formError = signal<string | null>(null);
  readonly deletingId = signal<number | null>(null);

  readonly transferFormOpenId = signal<number | null>(null);
  readonly transferring = signal(false);
  readonly transferResultByApartmentId = signal<Record<number, string>>({});
  readonly debtHandlingControl = this.fb.nonNullable.control<'TransfersToNewOwner' | 'StaysWithPreviousOwner'>('TransfersToNewOwner');

  readonly historyOpenId = signal<number | null>(null);
  readonly historyByApartmentId = signal<Record<number, ApartmentTransferRecord[]>>({});

  readonly buildingForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    address: ['', [Validators.required, Validators.maxLength(200)]],
  });

  readonly apartmentForm = this.fb.nonNullable.group({
    number: ['', [Validators.required, Validators.maxLength(10)]],
    floor: [0, [Validators.required]],
    idealParts: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
  });

  ngOnInit(): void {
    this.loadBuilding();
    this.loadApartments();
  }

  back(): void {
    this.router.navigateByUrl('/dashboard');
  }

  loadBuilding(): void {
    this.buildingLoading.set(true);
    this.buildingService.getMyBuilding().subscribe({
      next: (building) => {
        this.buildingForm.patchValue({ name: building.name, address: building.address });
        this.applyBuilding(building);
        this.buildingLoading.set(false);
      },
      error: (err: Error) => {
        this.buildingError.set(err.message);
        this.buildingLoading.set(false);
      },
    });
  }

  private applyBuilding(building: BuildingSummary): void {
    this.building.set(building);
    this.limitsForm.patchValue({
      expiresAt: building.inviteCodeExpiresAt ? building.inviteCodeExpiresAt.slice(0, 10) : '',
      maxUses: building.inviteCodeMaxUses,
    });
    this.quorumControl.setValue(building.quorumThresholdPercent);
  }

  saveQuorumThreshold(): void {
    this.quorumSaving.set(true);
    this.buildingService.updateQuorumThreshold(this.quorumControl.value).subscribe({
      next: (building) => {
        this.quorumSaving.set(false);
        this.applyBuilding(building);
      },
      error: () => this.quorumSaving.set(false),
    });
  }

  regenerateInviteCode(): void {
    if (!confirm('Старият код веднага става невалиден. Продължи?')) {
      return;
    }

    this.inviteActionLoading.set(true);
    this.inviteActionError.set(null);

    this.buildingService.regenerateInviteCode().subscribe({
      next: (building) => {
        this.applyBuilding(building);
        this.inviteActionLoading.set(false);
        if (this.logOpen()) {
          this.loadLog();
        }
      },
      error: (err: Error) => {
        this.inviteActionError.set(err.message);
        this.inviteActionLoading.set(false);
      },
    });
  }

  revokeInviteCode(): void {
    if (!confirm('Кодът ще спре да важи и никой няма да може да се присъедини с него, докато не генерираш нов. Продължи?')) {
      return;
    }

    this.inviteActionLoading.set(true);
    this.inviteActionError.set(null);

    this.buildingService.revokeInviteCode().subscribe({
      next: (building) => {
        this.applyBuilding(building);
        this.inviteActionLoading.set(false);
        if (this.logOpen()) {
          this.loadLog();
        }
      },
      error: (err: Error) => {
        this.inviteActionError.set(err.message);
        this.inviteActionLoading.set(false);
      },
    });
  }

  saveInviteCodeLimits(): void {
    const raw = this.limitsForm.getRawValue();

    this.inviteActionLoading.set(true);
    this.inviteActionError.set(null);

    this.buildingService
      .updateInviteCodeLimits({
        expiresAt: raw.expiresAt ? raw.expiresAt : null,
        maxUses: raw.maxUses,
      })
      .subscribe({
        next: (building) => {
          this.applyBuilding(building);
          this.inviteActionLoading.set(false);
          if (this.logOpen()) {
            this.loadLog();
          }
        },
        error: (err: Error) => {
          this.inviteActionError.set(err.message);
          this.inviteActionLoading.set(false);
        },
      });
  }

  toggleLog(): void {
    this.logOpen.set(!this.logOpen());
    if (this.logOpen() && this.log().length === 0) {
      this.loadLog();
    }
  }

  private loadLog(): void {
    this.logLoading.set(true);
    this.buildingService.getInviteCodeLog().subscribe({
      next: (entries) => {
        this.log.set(entries);
        this.logLoading.set(false);
      },
      error: () => {
        this.logLoading.set(false);
      },
    });
  }

  loadApartments(): void {
    this.apartmentsLoading.set(true);
    this.apartmentsError.set(null);
    this.buildingService.getApartments().subscribe({
      next: (res) => {
        this.apartments.set(res.apartments);
        this.idealPartsTotal.set(res.idealPartsTotal);
        this.apartmentsLoading.set(false);
      },
      error: (err: Error) => {
        this.apartmentsError.set(err.message);
        this.apartmentsLoading.set(false);
      },
    });
  }

  saveBuilding(): void {
    if (this.buildingForm.invalid) {
      this.buildingForm.markAllAsTouched();
      return;
    }

    this.buildingSaving.set(true);
    this.buildingError.set(null);
    this.buildingSaved.set(false);

    this.buildingService.updateMyBuilding(this.buildingForm.getRawValue()).subscribe({
      next: () => {
        this.buildingSaving.set(false);
        this.buildingSaved.set(true);
      },
      error: (err: Error) => {
        this.buildingSaving.set(false);
        this.buildingError.set(err.message);
      },
    });
  }

  startCreate(): void {
    this.editingId.set(null);
    this.apartmentForm.reset({ number: '', floor: 0, idealParts: 0 });
    this.formError.set(null);
    this.formOpen.set(true);
  }

  startEdit(apartment: ApartmentSummary): void {
    this.editingId.set(apartment.id);
    this.apartmentForm.reset({
      number: apartment.number,
      floor: apartment.floor,
      idealParts: apartment.idealParts,
    });
    this.formError.set(null);
    this.formOpen.set(true);
  }

  cancelForm(): void {
    this.formOpen.set(false);
    this.editingId.set(null);
    this.formError.set(null);
  }

  submitApartment(): void {
    if (this.apartmentForm.invalid) {
      this.apartmentForm.markAllAsTouched();
      return;
    }

    const request = this.apartmentForm.getRawValue();
    this.formSubmitting.set(true);
    this.formError.set(null);

    const editingId = this.editingId();
    const call = editingId
      ? this.buildingService.updateApartment(editingId, request)
      : this.buildingService.createApartment(request);

    call.subscribe({
      next: () => {
        this.formSubmitting.set(false);
        this.formOpen.set(false);
        this.editingId.set(null);
        this.loadApartments();
      },
      error: (err: Error) => {
        this.formSubmitting.set(false);
        this.formError.set(err.message);
      },
    });
  }

  deleteApartment(apartment: ApartmentSummary): void {
    if (!confirm(`Да изтрия ли апартамент ${apartment.number}?`)) {
      return;
    }

    this.deletingId.set(apartment.id);
    this.apartmentsError.set(null);

    this.buildingService.deleteApartment(apartment.id).subscribe({
      next: () => {
        this.deletingId.set(null);
        this.loadApartments();
      },
      error: (err: Error) => {
        this.deletingId.set(null);
        this.apartmentsError.set(err.message);
      },
    });
  }

  startTransfer(apartment: ApartmentSummary): void {
    this.debtHandlingControl.setValue('TransfersToNewOwner');
    this.transferFormOpenId.set(apartment.id);
  }

  cancelTransfer(): void {
    this.transferFormOpenId.set(null);
  }

  confirmTransfer(apartment: ApartmentSummary): void {
    if (!confirm(`Апартамент ${apartment.number}: текущият собственик ще загуби достъп. Продължи?`)) {
      return;
    }

    this.transferring.set(true);
    this.buildingService.transferApartment(apartment.id, this.debtHandlingControl.value).subscribe({
      next: (result) => {
        this.transferring.set(false);
        this.transferFormOpenId.set(null);
        this.transferResultByApartmentId.update((map) => ({
          ...map,
          [apartment.id]: `Прехвърлен. Неплатени задължения при прехвърлянето: ${result.outstandingBalance.toFixed(2)} лв.`,
        }));
        this.loadApartments();
      },
      error: (err: Error) => {
        this.transferring.set(false);
        this.apartmentsError.set(err.message);
      },
    });
  }

  toggleHistory(apartment: ApartmentSummary): void {
    if (this.historyOpenId() === apartment.id) {
      this.historyOpenId.set(null);
      return;
    }

    this.historyOpenId.set(apartment.id);
    if (!this.historyByApartmentId()[apartment.id]) {
      this.buildingService.getApartmentTransfers(apartment.id).subscribe({
        next: (records) => this.historyByApartmentId.update((map) => ({ ...map, [apartment.id]: records })),
        error: () => {},
      });
    }
  }

  historyFor(apartmentId: number): ApartmentTransferRecord[] {
    return this.historyByApartmentId()[apartmentId] ?? [];
  }
}
