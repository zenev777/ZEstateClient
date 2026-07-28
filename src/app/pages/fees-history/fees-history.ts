import { DecimalPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { BottomNav } from '../../shared/bottom-nav/bottom-nav';

interface MockPayment {
  title: string;
  date: string;
  amount: number;
  status: 'Pending' | 'Paid';
}

@Component({
  selector: 'app-fees-history',
  standalone: true,
  imports: [DecimalPipe, BottomNav],
  templateUrl: './fees-history.html',
})
export class FeesHistory {
  private readonly router = inject(Router);

  // Mocked — no payments API yet.
  readonly payments: MockPayment[] = [
    { title: 'Месечна вноска — Ноември', date: '01 ноем. 2026', amount: 42, status: 'Pending' },
    { title: 'Фонд Ремонт', date: '01 ноем. 2026', amount: 15, status: 'Pending' },
    { title: 'Месечна вноска — Октомври', date: '01 окт. 2026', amount: 42, status: 'Paid' },
    { title: 'Фонд Ремонт', date: '01 окт. 2026', amount: 15, status: 'Paid' },
    { title: 'Месечна вноска — Септември', date: '01 сеп. 2026', amount: 42, status: 'Paid' },
    { title: 'Извънредна вноска — авариен ремонт', date: '12 авг. 2026', amount: 80, status: 'Paid' },
  ];

  get dueTotal(): number {
    return this.payments.filter((p) => p.status === 'Pending').reduce((sum, p) => sum + p.amount, 0);
  }

  get paidTotal(): number {
    return this.payments.filter((p) => p.status === 'Paid').reduce((sum, p) => sum + p.amount, 0);
  }

  back(): void {
    this.router.navigateByUrl('/dashboard');
  }
}
