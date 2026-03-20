import {Injectable, signal, computed, inject, PLATFORM_ID} from '@angular/core';
import {Router} from '@angular/router';
import {isPlatformBrowser} from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  private userSignal = signal<{email: string, name: string} | null>(null);
  
  user = computed(() => this.userSignal());
  isAuthenticated = computed(() => !!this.userSignal());

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      // Check for existing session in localStorage
      const savedUser = localStorage.getItem('kenji_user');
      if (savedUser) {
        this.userSignal.set(JSON.parse(savedUser));
      }
    }
  }

  login(email: string, name: string) {
    const userData = { email, name };
    this.userSignal.set(userData);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('kenji_user', JSON.stringify(userData));
      // Force a full page reload to ensure the root component and all services are fully updated
      //window.location.href = '/admin/dashboard';
      this.router.navigate(['/admin/dashboard']);
    } else {
      this.router.navigate(['/admin/dashboard']);
    }
  }

  logout() {
    this.userSignal.set(null);
    if (isPlatformBrowser(this.platformId)) {
      // Clear all storage to ensure a complete reset of all components and services
      localStorage.clear();
      sessionStorage.clear();
      // Force a full page reload to reset the entire application state and re-render the root component
      window.location.href = '/';
    } else {
      this.router.navigate(['/']);
    }
  }
}
