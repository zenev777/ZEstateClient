import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { RoleManagementService } from '../../core/services/role-management.service';
import { BuildingMember, ManagerTransferStatus } from '../../core/models/role-management.models';
import { BottomNav } from '../../shared/bottom-nav/bottom-nav';

@Component({
  selector: 'app-role-management',
  standalone: true,
  imports: [ReactiveFormsModule, DatePipe, BottomNav],
  templateUrl: './role-management.html',
})
export class RoleManagement implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly roleService = inject(RoleManagementService);

  readonly membersLoading = signal(true);
  readonly members = signal<BuildingMember[]>([]);
  readonly membersError = signal<string | null>(null);
  readonly actioningUserId = signal<string | null>(null);

  readonly transferStatus = signal<ManagerTransferStatus | null>(null);
  readonly transferFormOpenFor = signal<string | null>(null);
  readonly transferSubmitting = signal(false);
  readonly transferError = signal<string | null>(null);
  readonly cancelling = signal(false);

  readonly passwordControl = this.fb.nonNullable.control('', Validators.required);

  ngOnInit(): void {
    this.loadMembers();
    this.loadTransferStatus();
  }

  back(): void {
    this.router.navigateByUrl('/dashboard');
  }

  loadMembers(): void {
    this.membersLoading.set(true);
    this.membersError.set(null);
    this.roleService.getBuildingMembers().subscribe({
      next: (members) => {
        this.members.set(members);
        this.membersLoading.set(false);
      },
      error: (err: Error) => {
        this.membersError.set(err.message);
        this.membersLoading.set(false);
      },
    });
  }

  loadTransferStatus(): void {
    this.roleService.getTransferStatus().subscribe({
      next: (status) => this.transferStatus.set(status),
      error: () => {},
    });
  }

  toggleCashier(member: BuildingMember): void {
    const isCashier = member.roles.includes('Cashier');
    const nextRole = isCashier ? 'Resident' : 'Cashier';

    this.actioningUserId.set(member.userId);
    this.membersError.set(null);

    this.roleService.changeRole(member.userId, nextRole).subscribe({
      next: () => {
        this.actioningUserId.set(null);
        this.loadMembers();
      },
      error: (err: Error) => {
        this.actioningUserId.set(null);
        this.membersError.set(err.message);
      },
    });
  }

  startTransfer(member: BuildingMember): void {
    this.passwordControl.reset('');
    this.transferError.set(null);
    this.transferFormOpenFor.set(member.userId);
  }

  cancelTransferForm(): void {
    this.transferFormOpenFor.set(null);
  }

  confirmTransfer(member: BuildingMember): void {
    if (this.passwordControl.invalid) {
      this.passwordControl.markAsTouched();
      return;
    }

    this.transferSubmitting.set(true);
    this.transferError.set(null);

    this.roleService.initiateTransfer(member.userId, this.passwordControl.value).subscribe({
      next: () => {
        this.transferSubmitting.set(false);
        this.transferFormOpenFor.set(null);
        this.loadTransferStatus();
      },
      error: (err: Error) => {
        this.transferSubmitting.set(false);
        this.transferError.set(err.message);
      },
    });
  }

  cancelPendingTransfer(): void {
    if (!confirm('Да отменя ли прехвърлянето на права?')) {
      return;
    }

    this.cancelling.set(true);
    this.roleService.cancelTransfer().subscribe({
      next: () => {
        this.cancelling.set(false);
        this.loadTransferStatus();
      },
      error: () => this.cancelling.set(false),
    });
  }
}
