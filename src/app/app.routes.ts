import { Routes } from '@angular/router';

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
  },
  { path: '**', redirectTo: '' },
];
