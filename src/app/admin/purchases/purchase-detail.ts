import { Component, inject, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { PurchasesService, Purchase } from './purchases.service';

@Component({
  selector: 'app-purchase-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule],
  templateUrl: `./purchase-detail.html`,
  styleUrl: './purchases.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PurchaseDetail {
  private route = inject(ActivatedRoute);
  private purchasesService = inject(PurchasesService);

  purchase = signal<Purchase | undefined>(undefined);

  constructor() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.purchasesService.getPurchaseById(id)
        .subscribe({
          next: (p) => this.purchase.set(p),
          error: (err) => console.error('Erro ao carregar compra', err)
        });
    }
  }

  print(): void {
    window.print();
  }
}
