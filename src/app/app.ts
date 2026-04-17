import { ChangeDetectionStrategy, Component, signal, inject, ChangeDetectorRef, PLATFORM_ID, HostListener, ElementRef, effect } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Sidebar } from './admin/sidebar/sidebar';
import { NotificationComponent } from './shared/components/notification';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from './auth/auth.service';
import { isPlatformBrowser } from '@angular/common';
import { MarketplacesService } from './services/marketplaces.service';
import { Marketplace } from './admin/marketplaces/marketplaces.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, Sidebar, MatIconModule, NotificationComponent],
  template: `
    <div class="flex h-screen overflow-hidden relative">
    <app-notification></app-notification>
      <!-- Loading Overlay for Logout/Reload -->
      @if (isReloading()) {
        <div class="fixed inset-0 bg-white/80 backdrop-blur-sm z-[9999] flex flex-col items-center justify-center animate-in fade-in duration-300">
          <div class="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <p class="text-slate-600 font-medium animate-pulse text-center px-4">Limpando sessão e recarregando componentes...</p>
        </div>
      }

      @if (isLoggedIn() && !isReloading()) {
        <app-sidebar [(isOpen)]="isSidebarOpen"></app-sidebar>
      }

      <!-- Main Content -->
      <main class="flex-1 flex flex-col overflow-y-auto">
        @if (isAuthenticated() && !isReloading()) {
          <header class="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-[100] shrink-0">
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
               <!-- Marketplaces Dropdown -->
               @if (isLoggedIn() && !isReloading()) {
              <div class="marketplace-dropdown-container relative hidden sm:block">
                <button 
                  (click)="isMarketplaceDropdownOpen.set(!isMarketplaceDropdownOpen())"
                  class="flex items-center gap-2 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 transition-all"
                >
                  @if (selectedMarketplace()) {
                    <img [src]="selectedMarketplace()?.logo" [alt]="selectedMarketplace()?.name" class="w-4 h-4 object-contain">
                    <span class="truncate max-w-[100px]">{{ selectedMarketplace()?.name }}</span>
                  } @else {
                    <mat-icon class="text-lg">storefront</mat-icon>
                    <span>Site</span>
                  }
                  <mat-icon [class.rotate-180]="isMarketplaceDropdownOpen()" class="text-slate-400 transition-transform">expand_more</mat-icon>
                </button>

                @if (isMarketplaceDropdownOpen()) {
                  <div class="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-2 animate-in fade-in zoom-in duration-200 z-50">
                    <div class="px-4 py-2 border-b border-slate-50 mb-1">
                      <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Seus Marketplaces</p>
                    </div>
                    @for (m of activeMarketplaces(); track m.id) {
                      <button 
                        (click)="selectMarketplace(m)"
                        class="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 text-left transition-colors"
                        [class.bg-blue-50]="selectedMarketplace()?.id === m.id"
                      >
                        <div class="w-8 h-8 rounded-lg bg-white border border-slate-100 p-1 flex items-center justify-center shrink-0 shadow-sm">
                          <img [src]="m.logo" [alt]="m.name" class="w-full h-full object-contain">
                        </div>
                        <div class="flex-1 min-w-0">
                          <p class="text-sm font-semibold text-slate-700 truncate line-height-tight">{{ m.name }}</p>
                          <p class="text-[10px] text-slate-500 truncate capitalize">{{ m.integrationType }}</p>
                        </div>
                        @if (selectedMarketplace()?.id === m.id) {
                          <mat-icon class="text-blue-500 text-lg">check_circle</mat-icon>
                        }
                      </button>
                    }
                    
                  </div>
                }
              </div>
}
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
export class App {
  private authService = inject(AuthService);
  private marketplaceService = inject(MarketplacesService);
  private cdr = inject(ChangeDetectorRef);
  private platformId = inject(PLATFORM_ID);
  private elementRef = inject(ElementRef);


  isSidebarOpen = signal(false);
  isReloading = signal(false);
  isAuthenticated = this.authService.isAuthenticated;


  isMarketplaceDropdownOpen = signal(false);

  @HostListener('document:click', ['$event'])
  onClick(event: MouseEvent) {
    if (this.isMarketplaceDropdownOpen() && !this.elementRef.nativeElement.querySelector('.marketplace-dropdown-container').contains(event.target)) {
      this.isMarketplaceDropdownOpen.set(false);
    }
  }
  activeMarketplaces = this.marketplaceService.activeMarketplaces;
  selectedMarketplace = this.marketplaceService.selectedMarketplace;

  selectMarketplace(m: Marketplace) {
    this.marketplaceService.setSelectedMarketplace(m);
    this.isMarketplaceDropdownOpen.set(false);
  }

  constructor() {
    this.marketplaceService.loadMarketplaces(); // 👈 FALTAVA ISSO

    effect(() => {
      const actives = this.activeMarketplaces();

      if (actives.length > 0 && !this.marketplaceService.selectedMarketplace()) {
        this.marketplaceService.setSelectedMarketplace(actives[0]);
      }
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

  isLoggedIn(): boolean {
    if (!isPlatformBrowser(this.platformId)) {
      return false;
    }

    const token = localStorage.getItem('kenji_token');
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Math.floor(Date.now() / 1000);

      return payload.exp > now;
    } catch {
      return false;
    }
  }


}
