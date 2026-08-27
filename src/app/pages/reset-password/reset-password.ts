import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { passwordsMatchValidator } from '../../shared/validators';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './reset-password.html',
})
export class ResetPassword {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  private readonly email = this.route.snapshot.queryParamMap.get('email') ?? '';
  private readonly token = this.route.snapshot.queryParamMap.get('token') ?? '';
  readonly linkMissing = !this.email || !this.token;

  readonly form = this.fb.nonNullable.group(
    {
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: passwordsMatchValidator('newPassword', 'confirmPassword') },
  );

  readonly submitting = signal(false);
  readonly submitError = signal<string | null>(null);
  readonly submitted = signal(false);

  submit(): void {
    if (this.linkMissing || this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.submitError.set(null);

    this.authService
      .resetPassword({
        email: this.email,
        token: this.token,
        ...this.form.getRawValue(),
      })
      .subscribe({
        next: () => {
          this.submitting.set(false);
          this.submitted.set(true);
        },
        error: (err: Error) => {
          this.submitting.set(false);
          this.submitError.set(err.message);
        },
      });
  }

  goToLogin(): void {
    this.router.navigateByUrl('/login');
  }
}
