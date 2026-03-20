import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, MatIconModule, RouterLink, RouterLinkActive],
  template: `
    <header class="border-b border-solid border-slate-200 bg-white sticky top-0 z-50">
      <div class="max-w-[1440px] mx-auto px-4 lg:px-8 py-3 lg:py-4 flex items-center justify-between gap-4">
        <!-- Logo -->
        <div class="flex items-center gap-4 lg:gap-12 shrink-0">
          <button 
            class="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            (click)="isMenuOpen.set(!isMenuOpen())"
            aria-label="Menu"
          >
            <mat-icon>{{ isMenuOpen() ? 'close' : 'menu' }}</mat-icon>
          </button>

          <a routerLink="/" class="flex items-center gap-2 lg:gap-3 hover:opacity-80 transition-opacity">
            <img src="/logo.svg" alt="Kenji Pet Logo" class="size-8 lg:size-10 object-contain" referrerpolicy="no-referrer">
            <h2 class="text-deep-teal text-lg lg:text-xl font-bold leading-tight tracking-tight uppercase hidden sm:block">Kenji Pet</h2>
          </a>

          <!-- Desktop Nav -->
          <nav class="hidden lg:flex items-center gap-8">
            <a class="text-slate-600 text-sm font-medium hover:text-accent transition-colors py-1" 
               routerLink="/" 
               routerLinkActive="text-accent font-bold border-b-2 border-accent" 
               [routerLinkActiveOptions]="{exact: true}">Produtos</a>
            <a class="text-slate-600 text-sm font-medium hover:text-accent transition-colors py-1" 
               routerLink="/sobre" 
               routerLinkActive="text-accent font-bold border-b-2 border-accent">Sobre</a>
            <a class="text-slate-600 text-sm font-medium hover:text-accent transition-colors py-1" 
               routerLink="/contato" 
               routerLinkActive="text-accent font-bold border-b-2 border-accent">Contato</a>
          </nav>
        </div>

        <!-- Search Bar -->
        <div class="flex-1 max-w-xl">
          <div class="relative group">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-accent">
              <mat-icon class="text-[18px] lg:text-[20px]">search</mat-icon>
            </div>
            <input
              class="block w-full pl-9 lg:pl-10 pr-3 py-1.5 lg:py-2 border border-slate-200 rounded-lg bg-slate-50 text-xs lg:text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all"
              placeholder="Pesquisar..."
              type="text"
            />
          </div>
        </div>

        <!-- Actions -->
        <div class="flex items-center gap-2 lg:gap-4 shrink-0">
        </div>
      </div>

      <!-- Mobile Nav -->
      @if (isMenuOpen()) {
        <div 
          class="lg:hidden bg-white border-t border-slate-100 px-4 py-4 flex flex-col gap-4 animate-in slide-in-from-top duration-200"
        >
          <a class="text-slate-600 text-base font-medium hover:text-accent transition-colors px-2 py-2 rounded-lg hover:bg-slate-50" 
             routerLink="/" 
             (click)="isMenuOpen.set(false)"
             routerLinkActive="bg-accent/10 text-accent font-bold" 
             [routerLinkActiveOptions]="{exact: true}">Produtos</a>
          <a class="text-slate-600 text-base font-medium hover:text-accent transition-colors px-2 py-2 rounded-lg hover:bg-slate-50" 
             routerLink="/sobre" 
             (click)="isMenuOpen.set(false)"
             routerLinkActive="bg-accent/10 text-accent font-bold">Sobre</a>
          <a class="text-slate-600 text-base font-medium hover:text-accent transition-colors px-2 py-2 rounded-lg hover:bg-slate-50" 
             routerLink="/contato" 
             (click)="isMenuOpen.set(false)"
             routerLinkActive="bg-accent/10 text-accent font-bold">Contato</a>
        </div>
      }
    </header>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Header {
  isMenuOpen = signal(false);
}
