import { ChangeDetectionStrategy, Component, inject, computed, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ReactiveFormsModule } from '@angular/forms';
import { StockService, Stock } from '../../../services/stock.service';
import { NotificationService } from '../../../shared/services/notification';

@Component({
  selector: 'app-stock-list',
  standalone: true,
  imports: [CommonModule, MatIconModule, ReactiveFormsModule],
  templateUrl: './stock-list.html',
  styleUrls: ['./stock-list.css', '../../admin-shared.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StockList implements OnInit {
  stockService = inject(StockService);
  private notificationService = inject(NotificationService);
  stocks = signal<Stock[]>([]);
  isLoading = signal(true);

ngOnInit() {
  this.isLoading.set(true);

  this.stockService.getStocks().subscribe({
    next: (data) => {
      setTimeout(() => {
        this.stocks.set(data);
        this.isLoading.set(false);
      }, 500); // garante que o loading aparece
    },
    error: () => {
      this.isLoading.set(false);
      this.notificationService.error('Erro ao buscar stocks');
    }
  });
}


  // Pagination
  currentPage = signal(1);
  itemsPerPage = signal(12);

  paginatedStocks = computed(() => {
    const allFiltered = this.stocks(); // ✅ aqui funciona, pois é um signal
    const page = this.currentPage();
    const perPage = this.itemsPerPage();
    const start = (page - 1) * perPage;
    return allFiltered.slice(start, start + perPage);
  });

  totalPages = computed(() => {
    return Math.ceil(this.stocks().length / this.itemsPerPage());
  });

  setPage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }


}
