import { Component, inject, ChangeDetectionStrategy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { PurchasesService, Purchase } from './purchases.service';

@Component({
  selector: 'app-purchases-list',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule],
  templateUrl: `./purchases-list.html`,
  styleUrl: './purchases.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PurchasesList implements OnInit {
  private purchasesService = inject(PurchasesService);
  purchases = signal<Purchase[]>([]);


  ngOnInit() {
    this.loadPurchases();
  }

  loadPurchases() {
    this.purchasesService.getAll()
      .subscribe({
        next: (data) => {
          this.purchases.set(data);
        },
        error: (err) => {
          console.error('Erro ao carregar compras', err);
        }
      });
  }
}
