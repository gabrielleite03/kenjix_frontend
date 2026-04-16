import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Header } from '../header/header';
import { Footer } from '../footer/footer';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-about-page',
  standalone: true,
  imports: [CommonModule, Header, Footer, MatIconModule],
  template: `
    <div class="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden bg-slate-50">
      <app-header></app-header>

      <main class="flex-1 max-w-[1440px] mx-auto w-full px-8 py-16">
        <div class="max-w-3xl mx-auto">
          <div class="flex items-center gap-4 mb-8">
            <div class="size-12 bg-primary rounded-xl flex items-center justify-center text-deep-teal shadow-md">
              <mat-icon class="text-[28px]">info</mat-icon>
            </div>
            <h1 class="text-4xl font-bold text-slate-900 tracking-tight">Sobre a Kenji Pet</h1>
          </div>

          <div class="prose prose-slate lg:prose-lg">
            <h2 class="text-2xl font-bold text-slate-800 mb-6">Nossa História</h2>
            <p class="text-slate-600 mb-6 leading-relaxed">
              A Kenji PET nasceu do amor pelos animais e da vontade de oferecer produtos selecionados com qualidade e preço justo. Acreditamos que pets são parte da família, e por isso buscamos sempre oferecer itens que garantam bem-estar, segurança e conforto.
            </p>
            <p class="text-slate-600 mb-12 leading-relaxed">
              Nosso compromisso é facilitar a vida dos tutores, proporcionando atendimento próximo, transparente e eficiente.
            </p>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-8 my-12">
              <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <mat-icon class="text-accent mb-4">favorite</mat-icon>
                <h3 class="text-lg font-bold text-slate-800 mb-2">Missão</h3>
                <p class="text-sm text-slate-500">Oferecer produtos pet de qualidade, promovendo saúde, conforto e felicidade aos animais, com atendimento humanizado e confiável.</p>
              </div>
              <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <mat-icon class="text-accent mb-4">visibility</mat-icon>
                <h3 class="text-lg font-bold text-slate-800 mb-2">Visão</h3>
                <p class="text-sm text-slate-500">Ser reconhecida como uma loja pet de confiança, referência em qualidade, atendimento e cuidado com cada cliente.</p>
              </div>
            </div>

            <div class="bg-slate-100/50 p-8 rounded-2xl border border-slate-200/60 my-12">
              <h2 class="text-2xl font-bold text-slate-800 mb-6">Valores</h2>
              <ul class="grid grid-cols-1 sm:grid-cols-2 gap-4 list-none p-0">
                <li class="flex items-center gap-3 text-slate-700">
                  <span class="text-xl">🐾</span> Amor pelos animais
                </li>
                <li class="flex items-center gap-3 text-slate-700">
                  <span class="text-xl">🐾</span> Compromisso com qualidade
                </li>
                <li class="flex items-center gap-3 text-slate-700">
                  <span class="text-xl">🐾</span> Transparência
                </li>
                <li class="flex items-center gap-3 text-slate-700">
                  <span class="text-xl">🐾</span> Respeito
                </li>
                <li class="flex items-center gap-3 text-slate-700">
                  <span class="text-xl">🐾</span> Atendimento humanizado
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      <app-footer></app-footer>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AboutPage {}
