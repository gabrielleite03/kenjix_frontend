import {Component, inject, ChangeDetectionStrategy} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterLink} from '@angular/router';
import {MatIconModule} from '@angular/material/icon';
import {PurchasesService} from './purchases.service';

@Component({
  selector: 'app-purchases-list',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule],
  template: `
    <div class="p-4 lg:p-8 space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-black text-slate-800 tracking-tight">Compras</h1>
          <p class="text-slate-500 text-sm">Gerencie a entrada de mercadorias e pedidos aos fornecedores.</p>
        </div>
        <a routerLink="new" class="flex items-center justify-center gap-2 bg-primary text-white px-6 py-2.5 rounded-xl font-bold mat-shadow hover:brightness-105 active:scale-95 transition-all">
          <mat-icon>add_circle</mat-icon>
          Nova Compra
        </a>
      </div>

      <div class="bg-white rounded-2xl mat-shadow border border-slate-100 overflow-hidden">
        <div class="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 class="font-bold text-slate-800">Histórico de Pedidos</h3>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-50/50 border-b border-slate-100">
                <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">ID</th>
                <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Data</th>
                <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Fornecedor</th>
                <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">NF</th>
                <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Tipo</th>
                <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Total</th>
                <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Ações</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              @for (purchase of purchases(); track purchase.id) {
                <tr class="hover:bg-slate-50/50 transition-colors">
                  <td class="px-6 py-4 text-sm font-bold text-slate-700">{{ purchase.id }}</td>
                  <td class="px-6 py-4 text-sm text-slate-500">{{ purchase.createdAt | date:'dd/MM/yyyy' }}</td>
                  <td class="px-6 py-4 text-sm text-slate-600 font-medium">{{ purchase.supplierName }}</td>
                  <td class="px-6 py-4 text-sm text-slate-500">
                    {{ purchase.invoiceNumber || '-' }}
                  </td>
                  <td class="px-6 py-4 text-sm text-slate-500">
                    <span class="px-2 py-0.5 rounded bg-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-600 border border-slate-200">
                      {{ purchase.invoiceType }}
                    </span>
                  </td>
                  <td class="px-6 py-4">
                    <span 
                      [class.bg-emerald-50]="purchase.status === 'Recebido'"
                      [class.text-emerald-600]="purchase.status === 'Recebido'"
                      [class.bg-amber-50]="purchase.status === 'Pendente'"
                      [class.text-amber-600]="purchase.status === 'Pendente'"
                      [class.bg-rose-50]="purchase.status === 'Cancelado'"
                      [class.text-rose-600]="purchase.status === 'Cancelado'"
                      class="px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border"
                    >
                      {{ purchase.status }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-sm font-black text-slate-800">R$ {{ purchase.total | number:'1.2-2' }}</td>
                  <td class="px-6 py-4 text-right">
                    <button class="p-2 text-slate-400 hover:text-primary transition-colors">
                      <mat-icon>visibility</mat-icon>
                    </button>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="8" class="px-6 py-12 text-center text-slate-400 italic">Nenhuma compra registrada.</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PurchasesList {
  private purchasesService = inject(PurchasesService);
  purchases = this.purchasesService.purchases;
}
