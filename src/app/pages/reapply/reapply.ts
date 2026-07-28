import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { BuildingSummary, ResidentStatus } from '../../core/models/auth.models';

@Component({
  selector: 'app-reapply',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './reapply.html',
})
export class Reapply {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly building = signal<BuildingSummary | null>(null);
  readonly checkingCode = signal(false);
  readonly codeError = signal<string | null>(null);
  readonly submitting = signal(false);
  readonly submitError = signal<string | null>(null);

  readonly codeControl = this.fb.nonNullable.control('', Validators.required);

  readonly form = this.fb.nonNullable.group({
    apartmentNumber: ['', [Validators.required, Validators.maxLength(10)]],
    status: ['Resident' as ResidentStatus, Validators.required],
    notes: [''],
  });

  checkCode(): void {
    const code = this.codeControl.value.trim();
    if (!code) {
      return;
    }

    this.checkingCode.set(true);
    this.codeError.set(null);

    this.authService.getBuildingByCode(code).subscribe({
      next: (building) => {
        this.building.set(building);
        this.checkingCode.set(false);
      },
      error: (err: Error) => {
        this.checkingCode.set(false);
        this.codeError.set(err.message);
      },
    });
  }

  setStatus(status: ResidentStatus): void {
    this.form.controls.status.setValue(status);
  }

  submit(): void {
    const building = this.building();
    if (!building || this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const values = this.form.getRawValue();

    this.submitting.set(true);
    this.submitError.set(null);

    this.authService
      .resubmitJoinRequest({
        inviteCode: building.inviteCode,
        apartmentNumber: values.apartmentNumber,
        status: values.status,
        notes: values.notes || null,
      })
      .subscribe({
        next: () => this.router.navigateByUrl('/dashboard'),
        error: (err: Error) => {
          this.submitting.set(false);
          this.submitError.set(err.message);
        },
      });
  }
}
