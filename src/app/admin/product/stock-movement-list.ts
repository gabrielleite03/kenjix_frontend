import {Component, inject, ChangeDetectionStrategy} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatIconModule} from '@angular/material/icon';
import {StockMovementService} from './stock-movement.service';

@Component({
  selector: 'app-stock-movement-list',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="p-4 lg:p-8 space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-black text-slate-800 tracking-tight">Movimentação de Estoque</h1>
          <p class="text-slate-500 text-sm">Histórico completo de entradas e saídas de produtos.</p>
        </div>
      </div>

      <div class="bg-white rounded-2xl mat-shadow border border-slate-100 overflow-hidden">
        <div class="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 class="font-bold text-slate-800">Histórico de Movimentações</h3>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-50/50 border-b border-slate-100">
                <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">ID</th>
                <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Data</th>
                <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Produto</th>
                <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Tipo</th>
                <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Quantidade</th>
                <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Motivo</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              @for (movement of movements(); track movement.id) {
                <tr class="hover:bg-slate-50/50 transition-colors">
                  <td class="px-6 py-4 text-sm font-bold text-slate-700">{{ movement.id }}</td>
                  <td class="px-6 py-4 text-sm text-slate-500">{{ movement.createdAt | date:'dd/MM/yyyy HH:mm' }}</td>
                  <td class="px-6 py-4 text-sm text-slate-600 font-medium">{{ movement.productName }}</td>
                  <td class="px-6 py-4">
                    <span 
                      [class.bg-emerald-50]="movement.type === 'Entrada'"
                      [class.text-emerald-600]="movement.type === 'Entrada'"
                      [class.bg-rose-50]="movement.type === 'Saída'"
                      [class.text-rose-600]="movement.type === 'Saída'"
                      class="px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border flex items-center gap-1 w-fit"
                    >
                      <mat-icon class="text-xs">{{ movement.type === 'Entrada' ? 'arrow_downward' : 'arrow_upward' }}</mat-icon>
                      {{ movement.type }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-sm font-black text-center" [class.text-emerald-600]="movement.type === 'Entrada'" [class.text-rose-600]="movement.type === 'Saída'">
                    {{ movement.type === 'Entrada' ? '+' : '-' }}{{ movement.quantity }}
                  </td>
                  <td class="px-6 py-4 text-sm text-slate-500">{{ movement.reason }}</td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="6" class="px-6 py-12 text-center text-slate-400 italic">Nenhuma movimentação registrada.</td>
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
    .mat-icon { width: 16px; height: 16px; font-size: 16px; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StockMovementList {
  private stockMovementService = inject(StockMovementService);
  movements = this.stockMovementService.movements;
}
