import {ChangeDetectionStrategy, Component, inject, computed} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatIconModule} from '@angular/material/icon';
import {ProductService} from '../product.service';

@Component({
  selector: 'app-stock-alerts',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="p-6">
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-2xl font-black text-slate-800 tracking-tight">Alertas de Estoque</h1>
          <p class="text-slate-500 font-medium">Produtos que precisam de atenção imediata</p>
        </div>
        <div class="flex items-center gap-3">
          @if (criticalCount() > 0) {
            <span class="px-3 py-1 bg-rose-100 text-rose-600 rounded-full text-xs font-bold uppercase tracking-wider">
              {{ criticalCount() }} Críticos
            </span>
          }
        </div>
      </div>

      <div class="grid grid-cols-1 gap-4">
        @for (alert of alerts(); track alert.id) {
          <div class="admin-card p-4 flex items-center gap-4 border-l-4" [class.border-l-rose-500]="alert.severity === 'high'" [class.border-l-amber-500]="alert.severity === 'medium'">
            <div class="w-12 h-12 rounded-xl flex items-center justify-center" [class.bg-rose-50]="alert.severity === 'high'" [class.bg-amber-50]="alert.severity === 'medium'">
              <mat-icon [class.text-rose-500]="alert.severity === 'high'" [class.text-amber-500]="alert.severity === 'medium'">
                {{ alert.severity === 'high' ? 'error' : 'warning' }}
              </mat-icon>
            </div>
            <div class="flex-1">
              <h3 class="font-bold text-slate-800">{{ alert.productName }}</h3>
              <p class="text-sm text-slate-500">Marca: {{ alert.brand }} | Categoria: {{ alert.category }}</p>
            </div>
            <div class="text-right">
              <p class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Estoque Atual</p>
              <p class="text-lg font-black" [class.text-rose-500]="alert.severity === 'high'" [class.text-amber-500]="alert.severity === 'medium'">
                {{ alert.currentStock }} un.
              </p>
              <p class="text-[10px] text-slate-400">Mínimo: {{ alert.minStock }} un.</p>
            </div>
            <button class="ml-4 p-2 hover:bg-slate-100 rounded-lg transition-colors text-primary">
              <mat-icon>shopping_cart</mat-icon>
            </button>
          </div>
        }
      </div>

      @if (alerts().length === 0) {
        <div class="admin-card p-12 text-center">
          <div class="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <mat-icon class="text-3xl">check_circle</mat-icon>
          </div>
          <h2 class="text-xl font-bold text-slate-800">Tudo em ordem!</h2>
          <p class="text-slate-500">Não há produtos com estoque baixo no momento.</p>
        </div>
      }
    </div>
  `,
  styles: [`
    :host { display: block; }
    .admin-card {
      background: white;
      border-radius: 1rem;
      box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05);
      border: 1px solid #f1f5f9;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StockAlerts {
  private productService = inject(ProductService);

  alerts = computed(() => {
    return this.productService.products()
      .filter(p => p.active && p.stock <= p.minStock)
      .map(p => ({
        id: p.id,
        productName: p.name,
        brand: p.brand,
        category: p.category,
        currentStock: p.stock,
        minStock: p.minStock,
        severity: p.stock === 0 ? 'high' : 'medium'
      }));
  });

  criticalCount = computed(() => {
    return this.alerts().filter(a => a.severity === 'high').length;
  });
}
