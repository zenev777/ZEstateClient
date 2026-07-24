import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { RegistrationWizardService } from '../../core/services/registration-wizard.service';
import { BuildingSummary, RegisterRequest, ResidentStatus } from '../../core/models/auth.models';
import { passwordsMatchValidator } from '../../shared/validators';

@Component({
  selector: 'app-register-resident',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './register-resident.html',
})
export class RegisterResident implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly authService = inject(AuthService);
  private readonly wizard = inject(RegistrationWizardService);

  readonly building = signal<BuildingSummary | null>(null);
  readonly loadingBuilding = signal(true);
  readonly submitting = signal(false);
  readonly errorMessage = signal<string | null>(null);

  private inviteCode = '';

  readonly form = this.fb.nonNullable.group(
    {
      firstName: ['', [Validators.required, Validators.maxLength(100)]],
      lastName: ['', [Validators.required, Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.pattern(/^\+?[0-9\s]{6,20}$/)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      apartmentNumber: ['', [Validators.required, Validators.maxLength(10)]],
      status: ['Resident' as ResidentStatus, Validators.required],
      notes: [''],
    },
    { validators: passwordsMatchValidator('password', 'confirmPassword') },
  );

  ngOnInit(): void {
    const code = this.route.snapshot.queryParamMap.get('code');
    if (!code) {
      this.router.navigateByUrl('/login');
      return;
    }
    this.inviteCode = code;

    const cached = this.wizard.residentBuilding;
    if (cached && cached.inviteCode === code) {
      this.building.set(cached);
      this.loadingBuilding.set(false);
      return;
    }

    this.authService.getBuildingByCode(code).subscribe({
      next: (building) => {
        this.wizard.setResidentBuilding(building);
        this.building.set(building);
        this.loadingBuilding.set(false);
      },
      error: () => {
        this.router.navigateByUrl('/login');
      },
    });
  }

  setStatus(status: ResidentStatus): void {
    this.form.controls.status.setValue(status);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const values = this.form.getRawValue();

    const request: RegisterRequest = {
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
      phoneNumber: values.phoneNumber || null,
      password: values.password,
      confirmPassword: values.confirmPassword,
      role: 'Resident',
      joinBuilding: {
        inviteCode: this.inviteCode,
        apartmentNumber: values.apartmentNumber,
        status: values.status,
        notes: values.notes || null,
      },
    };

    this.submitting.set(true);
    this.errorMessage.set(null);

    this.authService.register(request).subscribe({
      next: () => this.router.navigateByUrl('/register/resident/success'),
      error: (err: Error) => {
        this.submitting.set(false);
        this.errorMessage.set(err.message);
      },
    });
  }
}
