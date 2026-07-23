import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { RegistrationWizardService } from '../../core/services/registration-wizard.service';
import { passwordsMatchValidator } from '../../shared/validators';

@Component({
  selector: 'app-register-manager',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register-manager.html',
})
export class RegisterManager {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly wizard = inject(RegistrationWizardService);

  readonly form = this.fb.nonNullable.group(
    {
      firstName: ['', [Validators.required, Validators.maxLength(100)]],
      lastName: ['', [Validators.required, Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.pattern(/^\+?[0-9\s]{6,20}$/)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: passwordsMatchValidator('password', 'confirmPassword') },
  );

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.wizard.setManagerInfo(this.form.getRawValue());
    this.router.navigateByUrl('/register/manager/building');
  }
}
