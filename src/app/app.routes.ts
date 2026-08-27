import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home').then((m) => m.Home),
  },
  {
    path: 'register/manager',
    loadComponent: () =>
      import('./pages/register-manager/register-manager').then((m) => m.RegisterManager),
  },
  {
    path: 'register/manager/building',
    loadComponent: () =>
      import('./pages/create-building/create-building').then((m) => m.CreateBuilding),
  },
  {
    path: 'register/manager/success',
    loadComponent: () =>
      import('./pages/building-created/building-created').then((m) => m.BuildingCreated),
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/invite-code/invite-code').then((m) => m.InviteCode),
  },
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./pages/forgot-password/forgot-password').then((m) => m.ForgotPassword),
  },
  {
    path: 'reset-password',
    loadComponent: () =>
      import('./pages/reset-password/reset-password').then((m) => m.ResetPassword),
  },
  {
    path: 'register/resident',
    loadComponent: () =>
      import('./pages/register-resident/register-resident').then((m) => m.RegisterResident),
  },
  {
    path: 'register/resident/success',
    loadComponent: () =>
      import('./pages/register-waiting/register-waiting').then((m) => m.RegisterWaiting),
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard').then((m) => m.Dashboard),
    canActivate: [authGuard],
  },
  {
    path: 'dashboard/fees',
    loadComponent: () => import('./pages/fees-history/fees-history').then((m) => m.FeesHistory),
    canActivate: [authGuard],
  },
  {
    path: 'dashboard/reapply',
    loadComponent: () => import('./pages/reapply/reapply').then((m) => m.Reapply),
    canActivate: [authGuard],
  },
  {
    path: 'dashboard/building',
    loadComponent: () =>
      import('./pages/building-management/building-management').then((m) => m.BuildingManagement),
    canActivate: [authGuard],
  },
  {
    path: 'dashboard/fee-management',
    loadComponent: () =>
      import('./pages/fee-management/fee-management').then((m) => m.FeeManagement),
    canActivate: [authGuard],
  },
  {
    path: 'dashboard/payments',
    loadComponent: () =>
      import('./pages/payment-management/payment-management').then((m) => m.PaymentManagement),
    canActivate: [authGuard],
  },
  {
    path: 'dashboard/repairs',
    loadComponent: () =>
      import('./pages/repair-management/repair-management').then((m) => m.RepairManagement),
    canActivate: [authGuard],
  },
  {
    path: 'dashboard/reports',
    loadComponent: () =>
      import('./pages/financial-reports/financial-reports').then((m) => m.FinancialReports),
    canActivate: [authGuard],
  },
  {
    path: 'dashboard/meetings',
    loadComponent: () =>
      import('./pages/meeting-management/meeting-management').then((m) => m.MeetingManagement),
    canActivate: [authGuard],
  },
  {
    path: 'dashboard/roles',
    loadComponent: () =>
      import('./pages/role-management/role-management').then((m) => m.RoleManagement),
    canActivate: [authGuard],
  },
  {
    path: 'dashboard/chat',
    loadComponent: () => import('./pages/chat/chat').then((m) => m.Chat),
    canActivate: [authGuard],
  },
  {
    path: 'dashboard/documents',
    loadComponent: () =>
      import('./pages/document-center/document-center').then((m) => m.DocumentCenter),
    canActivate: [authGuard],
  },
  { path: '**', redirectTo: '' },
];
