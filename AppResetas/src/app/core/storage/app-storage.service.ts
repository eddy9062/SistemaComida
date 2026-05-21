import { Injectable } from '@angular/core';
import { AuthSession } from '../../shared/interfaces/auth-session.interface';

const SESSION_KEY = 'appcomida.session';

@Injectable({ providedIn: 'root' })
export class AppStorageService {
  get session(): AuthSession | null {
    const value = localStorage.getItem(SESSION_KEY);
    return value ? JSON.parse(value) as AuthSession : null;
  }

  setSession(session: AuthSession): void {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    localStorage.setItem('token', session.token);
    localStorage.setItem('usuario', session.usuario ?? '');
    localStorage.setItem('empresa', String(session.empresa ?? session.cod_empresa ?? ''));
    localStorage.setItem('sucursal', String(session.sucursal ?? ''));
    localStorage.setItem('rol', String(session.rol ?? ''));
  }

  clear(): void {
    localStorage.removeItem(SESSION_KEY);
    ['token', 'usuario', 'empresa', 'cod_empresa', 'sucursal', 'rol'].forEach((key) => localStorage.removeItem(key));
  }
}