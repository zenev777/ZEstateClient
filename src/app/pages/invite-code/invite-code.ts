import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { RegistrationWizardService } from '../../core/services/registration-wizard.service';

@Component({
  selector: 'app-invite-code',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './invite-code.html',
})
export class InviteCode {
  private readonly authService = inject(AuthService);
  private readonly wizard = inject(RegistrationWizardService);
  private readonly router = inject(Router);

  code = '';
  readonly checking = signal(false);
  readonly errorMessage = signal<string | null>(null);

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
