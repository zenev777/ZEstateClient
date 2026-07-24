import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { RegistrationWizardService } from '../../core/services/registration-wizard.service';
import { SessionService } from '../../core/services/session.service';

@Component({
  selector: 'app-invite-code',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, RouterLink],
  templateUrl: './invite-code.html',
})
export class InviteCode {
  private readonly authService = inject(AuthService);
  private readonly wizard = inject(RegistrationWizardService);
  private readonly session = inject(SessionService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly loginForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  readonly loggingIn = signal(false);
  readonly loginError = signal<string | null>(null);

  code = '';
  readonly checking = signal(false);
  readonly errorMessage = signal<string | null>(null);

  login(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loggingIn.set(true);
    this.loginError.set(null);

    this.authService.login(this.loginForm.getRawValue()).subscribe({
      next: (response) => {
        this.session.save(response);
        this.router.navigateByUrl(response.roles.includes('HouseManager') ? '/dashboard' : '/');
      },
      error: (err: Error) => {
        this.loggingIn.set(false);
        this.loginError.set(err.message);
      },
    });
  }

  checkCode(): void {
    const trimmed = this.code.trim();
    if (!trimmed) {
      return;
    }

    this.checking.set(true);
    this.errorMessage.set(null);

    this.authService.getBuildingByCode(trimmed).subscribe({
      next: (building) => {
        this.wizard.setResidentBuilding(building);
        this.router.navigate(['/register/resident'], { queryParams: { code: building.inviteCode } });
      },
      error: (err: Error) => {
        this.checking.set(false);
        this.errorMessage.set(err.message);
      },
    });
  }
}
