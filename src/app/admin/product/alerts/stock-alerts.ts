import {ChangeDetectionStrategy, Component, inject, computed} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatIconModule} from '@angular/material/icon';
import {ProductService} from '../product.service';

@Component({
  selector: 'app-stock-alerts',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: `stock-alerts.html`,
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
