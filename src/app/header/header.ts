import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, MatIconModule, RouterLink, RouterLinkActive],
  template: `
    <header class="flex items-center justify-between border-b border-solid border-slate-200 bg-white px-8 py-4 sticky top-0 z-50">
      <div class="flex items-center gap-12">
        <a routerLink="/" class="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <img src="/logo.svg" alt="Kenji Pet Logo" class="size-10 object-contain" referrerpolicy="no-referrer">
          <h2 class="text-deep-teal text-xl font-bold leading-tight tracking-tight uppercase">Kenji Pet</h2>
        </a>
        <nav class="hidden lg:flex items-center gap-8">
          <a class="text-slate-600 text-sm font-medium hover:text-accent transition-colors" 
             routerLink="/" 
             routerLinkActive="text-accent font-bold border-b-2 border-accent pb-1" 
             [routerLinkActiveOptions]="{exact: true}">Produtos</a>
          <a class="text-slate-600 text-sm font-medium hover:text-accent transition-colors" 
             routerLink="/sobre" 
             routerLinkActive="text-accent font-bold border-b-2 border-accent pb-1">Sobre</a>
          <a class="text-slate-600 text-sm font-medium hover:text-accent transition-colors" 
             routerLink="/contato" 
             routerLinkActive="text-accent font-bold border-b-2 border-accent pb-1">Contato</a>
        </nav>
      </div>

      <div class="flex-1 max-w-xl mx-8">
        <div class="relative group">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-accent">
            <mat-icon class="text-[20px]">search</mat-icon>
          </div>
          <input
            class="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all"
            placeholder="Pesquisar produtos, marcas ou categorias..."
            type="text"
          />
        </div>
      </div>

      <div class="flex items-center gap-4">
      </div>
    </header>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Header {}
