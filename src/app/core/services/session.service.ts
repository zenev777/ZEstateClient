import { Injectable, signal } from '@angular/core';
import { AuthResponse } from '../models/auth.models';

const STORAGE_KEY = 'zestate.session';

interface StoredSession {
  token: string;
  email: string;
  name: string;
  roles: string[];
}

@Injectable({ providedIn: 'root' })
export class SessionService {
  private readonly session = signal<StoredSession | null>(this.readFromStorage());

  readonly isLoggedIn = () => this.session() !== null;

  save(response: AuthResponse): void {
    const stored: StoredSession = {
      token: response.token,
      email: response.email,
      name: response.name,
      roles: response.roles,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
    this.session.set(stored);
  }

  clear(): void {
    localStorage.removeItem(STORAGE_KEY);
    this.session.set(null);
  }

  getToken(): string | null {
    return this.session()?.token ?? null;
  }

  getName(): string | null {
    return this.session()?.name ?? null;
  }

  hasRole(role: string): boolean {
    return this.session()?.roles.includes(role) ?? false;
  }

  private readFromStorage(): StoredSession | null {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as StoredSession;
    } catch {
      return null;
    }
  }
}
