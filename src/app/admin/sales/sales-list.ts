import {Component, inject, ChangeDetectionStrategy} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterLink} from '@angular/router';
import {MatIconModule} from '@angular/material/icon';
import {SalesService} from './sales.service';

@Component({
  selector: 'app-sales-list',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule],
  template: `
    <div class="p-4 lg:p-8 space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-black text-slate-800 tracking-tight">Vendas</h1>
          <p class="text-slate-500 text-sm">Gerencie o histórico de vendas e PDV.</p>
        </div>
        <a routerLink="pos" class="flex items-center justify-center gap-2 bg-primary text-white px-6 py-2.5 rounded-xl font-bold mat-shadow hover:brightness-105 active:scale-95 transition-all">
          <mat-icon>add_shopping_cart</mat-icon>
          Nova Venda (PDV)
        </a>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-white p-6 rounded-2xl mat-shadow border border-slate-100">
          <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Vendas Hoje</p>
          <h3 class="text-2xl font-black text-slate-800">{{ todaySalesCount() }}</h3>
        </div>
        <div class="bg-white p-6 rounded-2xl mat-shadow border border-slate-100">
          <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Faturamento Hoje</p>
          <h3 class="text-2xl font-black text-emerald-600">R$ {{ todayRevenue() | number:'1.2-2' }}</h3>
        </div>
        <div class="bg-white p-6 rounded-2xl mat-shadow border border-slate-100">
          <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Ticket Médio</p>
          <h3 class="text-2xl font-black text-primary">R$ {{ averageTicket() | number:'1.2-2' }}</h3>
        </div>
      </div>

      <div class="bg-white rounded-2xl mat-shadow border border-slate-100 overflow-hidden">
        <div class="p-6 border-b border-slate-100">
          <h3 class="font-bold text-slate-800">Histórico Recente</h3>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-50/50 border-b border-slate-100">
                <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">ID</th>
                <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Data/Hora</th>
                <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Cliente</th>
                <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Pagamento</th>
                <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Total</th>
                <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Ações</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              @for (sale of sales(); track sale.id) {
                <tr class="hover:bg-slate-50/50 transition-colors">
                  <td class="px-6 py-4 text-sm font-bold text-slate-700">{{ sale.id }}</td>
                  <td class="px-6 py-4 text-sm text-slate-500">{{ sale.createdAt | date:'dd/MM/yyyy HH:mm' }}</td>
                  <td class="px-6 py-4 text-sm text-slate-600">{{ sale.customerName || 'Consumidor Final' }}</td>
                  <td class="px-6 py-4">
                    <span class="px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600">
                      {{ sale.paymentMethod }}
                    </span>
                  </td>
                  <td class="px-6 py-4">
                    <div class="flex flex-col">
                      <span class="text-sm font-black text-slate-800">R$ {{ sale.total | number:'1.2-2' }}</span>
                      @if (sale.discount > 0) {
                        <span class="text-[10px] font-bold text-rose-500">- R$ {{ sale.discount | number:'1.2-2' }} desc.</span>
                      }
                    </div>
                  </td>
                  <td class="px-6 py-4 text-right">
                    <button class="p-2 text-slate-400 hover:text-primary transition-colors">
                      <mat-icon>visibility</mat-icon>
                    </button>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="6" class="px-6 py-12 text-center text-slate-400 italic">Nenhuma venda registrada.</td>
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
export class SalesList {
  private salesService = inject(SalesService);
  sales = this.salesService.sales;

  todaySalesCount() {
    const today = new Date().toDateString();
    return this.sales().filter(s => s.createdAt.toDateString() === today).length;
  }

  todayRevenue() {
    const today = new Date().toDateString();
    return this.sales()
      .filter(s => s.createdAt.toDateString() === today)
      .reduce((acc, s) => acc + s.total, 0);
  }

  averageTicket() {
    const count = this.sales().length;
    if (count === 0) return 0;
    const total = this.sales().reduce((acc, s) => acc + s.total, 0);
    return total / count;
  }
}
