import {ChangeDetectionStrategy, Component, signal, inject, ChangeDetectorRef, OnInit} from '@angular/core';
import {RouterOutlet, Router, NavigationEnd} from '@angular/router';
import {CommonModule} from '@angular/common';
import {Sidebar} from './admin/sidebar/sidebar';
import {MatIconModule} from '@angular/material/icon';
import {AuthService} from './auth/auth.service';
import {filter} from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, Sidebar, MatIconModule],
  template: `
    <div class="flex h-screen overflow-hidden relative">
      <!-- Loading Overlay for Logout/Reload -->
      @if (isReloading()) {
        <div class="fixed inset-0 bg-white/80 backdrop-blur-sm z-[9999] flex flex-col items-center justify-center animate-in fade-in duration-300">
          <div class="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <p class="text-slate-600 font-medium animate-pulse text-center px-4">Limpando sessão e recarregando componentes...</p>
        </div>
      }

      @if (isAuthenticated() && !isReloading()) {
        <app-sidebar [(isOpen)]="isSidebarOpen"></app-sidebar>
      }

      <!-- Main Content -->
      <main class="flex-1 flex flex-col overflow-y-auto">
        @if (isAuthenticated() && !isReloading()) {
          <header class="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-10 shrink-0">
            <div class="flex items-center gap-3 lg:gap-4 flex-1">
              <button (click)="isSidebarOpen.set(true)" class="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg">
                <mat-icon>menu</mat-icon>
              </button>
              <div class="flex items-center gap-2">
                <div class="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white lg:hidden">
                  <mat-icon class="text-lg">pets</mat-icon>
                </div>
                <h2 class="text-lg lg:text-xl font-semibold text-slate-800 truncate">Kenji Pet Admin</h2>
              </div>
            </div>
            <div class="flex items-center gap-2 lg:gap-4">
              <button class="p-2 text-slate-500 hover:bg-slate-100 rounded-full relative">
                <mat-icon>notifications</mat-icon>
                <span class="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
              </button>
              <div class="hidden sm:block h-6 w-px bg-slate-200 mx-1"></div>
              <div class="hidden sm:flex items-center gap-2 text-sm font-medium text-slate-600">
                <mat-icon class="text-lg">language</mat-icon>
                <span>PT-BR</span>
              </div>
              <div class="h-6 w-px bg-slate-200 mx-1"></div>
              <button 
                (click)="logout()"
                class="flex items-center gap-2 px-3 py-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors font-bold text-sm"
                title="Sair do Painel"
              >
                <mat-icon class="text-lg">logout</mat-icon>
                <span class="hidden md:inline">Sair</span>
              </button>
            </div>
          </header>
        }

        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App implements OnInit {
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);
  
  isSidebarOpen = signal(false);
  isReloading = signal(false);
  isAuthenticated = this.authService.isAuthenticated;

  ngOnInit() {
    // Listen for navigation events to force root component re-render
    // This ensures the shell (sidebar, header) is always in sync with the route
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.cdr.detectChanges();
    });
  }

  logout() {
    this.isReloading.set(true);
    this.cdr.detectChanges();
    
    // Small delay to show the loading state before the full reload
    setTimeout(() => {
      this.authService.logout();
    }, 800);
  }
}
