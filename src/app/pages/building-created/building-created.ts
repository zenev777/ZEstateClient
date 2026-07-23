import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { RegistrationWizardService } from '../../core/services/registration-wizard.service';

@Component({
  selector: 'app-building-created',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './building-created.html',
})
export class BuildingCreated implements OnInit {
  private readonly router = inject(Router);
  private readonly wizard = inject(RegistrationWizardService);

  readonly copied = signal(false);
  readonly inviteCode = signal('');

  ngOnInit(): void {
    const code = this.wizard.managerResult?.buildingInviteCode;
    if (!code) {
      this.router.navigateByUrl('/register/manager');
      return;
    }
    this.inviteCode.set(code);
  }

  copyCode(): void {
    navigator.clipboard?.writeText(this.inviteCode()).catch(() => {});
    this.copied.set(true);
    setTimeout(() => this.copied.set(false), 1500);
  }
}
