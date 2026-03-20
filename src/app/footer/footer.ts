import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, MatIconModule, RouterLink],
  template: `
    <footer class="bg-white border-t border-slate-200 mt-12 py-12 px-8">
      <div class="max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        <div class="flex flex-col gap-4">
          <a routerLink="/" class="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <img src="/logo.svg" alt="Kenji Pet Logo" class="size-8 object-contain" referrerpolicy="no-referrer">
            <h2 class="text-deep-teal text-lg font-bold tracking-tight uppercase">Kenji Pet</h2>
          </a>
          <p class="text-sm text-slate-500 leading-relaxed">
            Suprimentos premium para pets e serviços de cuidados profissionais desde 2010. Tratamos seus pets como se fossem nossos.
          </p>
        </div>
        <div>
          <h4 class="font-bold text-slate-800 mb-6 uppercase text-xs tracking-widest">Loja</h4>
          <ul class="flex flex-col gap-3 text-sm text-slate-500">
            <li><a class="hover:text-accent" routerLink="/">Artigos para Cães</a></li>
            <li><a class="hover:text-accent" routerLink="/">Artigos para Gatos</a></li>
            <li><a class="hover:text-accent" routerLink="/">Pássaros e Pequenos Pets</a></li>
            <li><a class="hover:text-accent" routerLink="/">Promoções</a></li>
          </ul>
        </div>
        <div>
          <h4 class="font-bold text-slate-800 mb-6 uppercase text-xs tracking-widest">Institucional</h4>
          <ul class="flex flex-col gap-3 text-sm text-slate-500">
            <li><a class="hover:text-accent" routerLink="/sobre">Sobre Nós</a></li>
            <li><a class="hover:text-accent" href="#">Nossas Lojas</a></li>
            <li><a class="hover:text-accent" href="#">Trabalhe Conosco</a></li>
            <li><a class="hover:text-accent" routerLink="/contato">Contato</a></li>
          </ul>
        </div>
        <div>
          <h4 class="font-bold text-slate-800 mb-6 uppercase text-xs tracking-widest">Conecte-se</h4>
          <div class="flex gap-4">
            <a class="size-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-accent hover:text-white transition-all" href="mailto:contato@kenjipet.com.br">
              <mat-icon>alternate_email</mat-icon>
            </a>
            <a class="size-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-accent hover:text-white transition-all" href="#">
              <mat-icon>call</mat-icon>
            </a>
            <a class="size-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-accent hover:text-white transition-all" href="#">
              <mat-icon>location_on</mat-icon>
            </a>
          </div>
        </div>
      </div>
      <div class="max-w-[1440px] mx-auto mt-12 pt-8 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-400 text-center sm:text-left">
        <p>© 2024 Kenji Pet Shop. Todos os direitos reservados.</p>
        <div class="flex gap-6">
          <a class="hover:text-accent transition-colors" href="#">Política de Privacidade</a>
          <a class="hover:text-accent transition-colors" href="#">Termos de Serviço</a>
        </div>
      </div>
    </footer>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Footer {}
