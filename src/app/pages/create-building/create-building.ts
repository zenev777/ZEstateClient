import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { RegistrationWizardService } from '../../core/services/registration-wizard.service';
import { SessionService } from '../../core/services/session.service';
import { RegisterRequest } from '../../core/models/auth.models';

@Component({
  selector: 'app-create-building',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './create-building.html',
})
export class CreateBuilding implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly wizard = inject(RegistrationWizardService);
  private readonly authService = inject(AuthService);
  private readonly session = inject(SessionService);

  readonly submitting = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    livesInBuilding: [false, Validators.required],
    name: ['', [Validators.required, Validators.maxLength(100)]],
    address: ['', [Validators.required, Validators.maxLength(200)]],
    apartmentNumber: [''],
    floor: [''],
  });

  ngOnInit(): void {
    if (!this.wizard.managerInfo) {
      this.router.navigateByUrl('/register/manager');
    }
  }

  setLivesInBuilding(value: boolean): void {
    this.form.controls.livesInBuilding.setValue(value);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const managerInfo = this.wizard.managerInfo;
    if (!managerInfo) {
      this.router.navigateByUrl('/register/manager');
      return;
    }

    const { livesInBuilding, name, address, apartmentNumber, floor } = this.form.getRawValue();

    const request: RegisterRequest = {
      firstName: managerInfo.firstName,
      lastName: managerInfo.lastName,
      email: managerInfo.email,
      phoneNumber: managerInfo.phoneNumber || null,
      password: managerInfo.password,
      confirmPassword: managerInfo.confirmPassword,
      role: 'HouseManager',
      building: {
        name,
        address,
        livesInBuilding,
        apartmentNumber: livesInBuilding ? apartmentNumber || null : null,
        floor: livesInBuilding && floor ? Number(floor) : null,
      },
    };

    this.submitting.set(true);
    this.errorMessage.set(null);

    this.authService.register(request).subscribe({
      next: (response) => {
        this.session.save(response);
        this.wizard.setManagerResult(response);
        this.router.navigateByUrl('/register/manager/success');
      },
      error: (err: Error) => {
        this.submitting.set(false);
        this.errorMessage.set(err.message);
      },
    });
  }
}
