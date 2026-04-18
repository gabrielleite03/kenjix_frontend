import { ChangeDetectionStrategy, Component, inject, computed, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ProductService } from '../product.service';
import { StockService, Stock } from '../../../services/stock.service';
import { NotificationService } from '../../../shared/services/notification';
type Severity = 'high' | 'medium' | 'ok'; // 👈 AQUI

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
export class StockAlerts implements OnInit {
  private productService = inject(ProductService);
  private notificationService = inject(NotificationService);
  stockService = inject(StockService);
  

  stocks = signal<Stock[]>([]);
  isLoading = signal(true);

  ngOnInit() {
    this.isLoading.set(true);

    this.stockService.getStocks().subscribe({
      next: (data) => {
        setTimeout(() => {
          this.stocks.set(data);
          this.isLoading.set(false);
          console.log(this.stocks())
        }, 500); // garante que o loading aparece
      },
      error: () => {
        this.isLoading.set(false);
        this.notificationService.error('Erro ao buscar stocks');
      }
    });
  }

 

  alerts = computed(() => {
    const priority: Record<Severity, number> = {
      high: 0,
      medium: 1,
      ok: 2
    };

    return this.stocks()
      .filter(s => s.active)
      .map(s => {
        const severity: Severity =
          s.quantity <= 5 ? 'high' :
            s.quantity <= 10 ? 'medium' :
              'ok';

        return {
          id: s.productId,
          productName: s.productName,
          currentStock: s.quantity,
          warehouseName: s.warehouseName,
          warehousePlaceName: s.warehousePlaceName,
          minStock: 5,
          severity
        };
      })
      .sort((a, b) => {
        // 🔥 1. ordenar por quantidade
        if (a.currentStock !== b.currentStock) {
          return a.currentStock - b.currentStock;
        }

        // 🔥 2. ordenar por severidade
        return priority[a.severity] - priority[b.severity];
      });
  });

  criticalCount = computed(() => {
    return this.alerts().filter(a => a.severity === 'high').length;
  });
}
