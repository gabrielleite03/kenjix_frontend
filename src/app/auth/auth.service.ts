import {Injectable, signal, computed, inject, PLATFORM_ID} from '@angular/core';
import {Router} from '@angular/router';
import {isPlatformBrowser} from '@angular/common';
import {HttpClient} from '@angular/common/http';
import { error } from 'node:console';
import { tap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { environment } from '../../../src/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  

  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  private http = inject(HttpClient);

  private userSignal = signal<{email: string, name: string} | null>(null);

  user = computed(() => this.userSignal());
  isAuthenticated = computed(() => !!this.userSignal());

  private API = environment.API_URL;

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      const savedUser = localStorage.getItem('kenji_user');
      if (savedUser) {
        this.userSignal.set(JSON.parse(savedUser));
      }
    }
  }

login(username: string, password: string) {
  return this.http.post<LoginResponse>(`${this.API}/login`, {
    userName: username,
    password: password
  }).pipe(
    tap((resp) => {
      const userData = {
        email: resp.username,
        name: resp.username
      };

      this.userSignal.set(userData);

      if (isPlatformBrowser(this.platformId)) {
        localStorage.setItem('kenji_user', JSON.stringify(userData));
        localStorage.setItem('kenji_token', resp.accessToken);
        localStorage.setItem('kenji_refresh', resp.refreshToken);
        localStorage.setItem('kenji_roles', JSON.stringify(this.getRolesFromToken(resp.accessToken)));
      }

      this.router.navigate(['/admin/dashboard']);
    }),
    catchError((err) => {
      console.error('Erro no login:', err);

      let message = 'Erro ao realizar login';

      if (err.status === 401) {
        message = 'Usuário ou senha inválidos';
      } else if (err.error?.message) {
        message = err.error.message;
      }

      return throwError(() => new Error(message));
    })
  );
}

  getRolesFromToken(token: string): string[] {
    if (!token) return [];

    try {
      const payload = token.split('.')[1];
      const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
      const decoded = JSON.parse(atob(base64));
      return decoded.roles || [];
    } catch (e) {
      console.error('Erro ao decodificar token', e);
      return [];
    }
  }

  logout() {
    this.userSignal.set(null);

    if (isPlatformBrowser(this.platformId)) {
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = '/';
    } else {
      this.router.navigate(['/']);
    }
  }

  getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('kenji_token');
    }
    return null;
  }
}
interface LoginResponse {
  username: string;
  authenticated: boolean;
  created: string;
  expiration: string;
  accessToken: string;
  refreshToken: string;
}