import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, map, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthSession, LoginRequest } from '../../shared/interfaces/auth-session.interface';
import { AppStorageService } from '../storage/app-storage.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentSession: AuthSession | null;

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router,
    private readonly storage: AppStorageService
  ) {
    this.currentSession = this.storage.session;
  }

  get session(): AuthSession | null {
    return this.currentSession;
  }

  isAuthenticated(): boolean {
    return !!this.currentSession?.token && !this.isTokenExpired();
  }

  login(credentials: LoginRequest): Observable<AuthSession> {
    return this.http.post<Record<string, unknown>>(`${environment.apiUrl}login`, credentials).pipe(
      map((response) => this.normalizeSession(response)),
      tap((session) => {
        this.storage.setSession(session);
        this.currentSession = session;
      })
    );
  }

  logout(): void {
    this.storage.clear();
    this.currentSession = null;
    this.router.navigateByUrl('/login');
  }

  token(): string | null {
    return this.currentSession?.token ?? null;
  }

  isTokenExpired(): boolean {
    const expiresAt = this.currentSession?.expiresAt;
    return !!expiresAt && Date.now() >= expiresAt;
  }

  private normalizeSession(response: Record<string, unknown>): AuthSession {
    const token = String(response['token'] ?? response['jwt'] ?? response['access_token'] ?? '');
    const decoded = this.decodeJwt(token);
    const user = this.asRecord(response['usuario']) ?? decoded ?? {};

    return {
      token,
      usuario: String(user['usuario'] ?? user['username'] ?? response['usuario'] ?? ''),
      empresa: this.toSessionValue(user['empresa'] ?? user['cod_empresa'] ?? response['empresa'] ?? response['cod_empresa']),
      cod_empresa: this.toSessionValue(user['cod_empresa'] ?? response['cod_empresa']),
      sucursal: this.toSessionValue(user['sucursal'] ?? response['sucursal']),
      rol: String(user['rol'] ?? user['role'] ?? response['rol'] ?? response['role'] ?? ''),
      expiresAt: typeof decoded?.['exp'] === 'number' ? Number(decoded['exp']) * 1000 : undefined,
      raw: response
    };
  }

  private decodeJwt(token: string): Record<string, unknown> | null {
    try {
      const payload = token.split('.')[1];
      return payload ? JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/'))) as Record<string, unknown> : null;
    } catch {
      return null;
    }
  }

  private asRecord(value: unknown): Record<string, unknown> | null {
    return value !== null && typeof value === 'object' ? value as Record<string, unknown> : null;
  }

  private toSessionValue(value: unknown): string | number | undefined {
    return typeof value === 'string' || typeof value === 'number' ? value : undefined;
  }
}