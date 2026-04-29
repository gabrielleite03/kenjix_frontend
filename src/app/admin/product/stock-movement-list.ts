import { Component, inject, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { StockMovementService } from './stock-movement.service';

@Component({
  selector: 'app-stock-movement-list',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: `stock-movement-list.html`,
  styles: [`
    :host { display: block; }
    .mat-icon { width: 16px; height: 16px; font-size: 16px; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StockMovementList implements OnInit {
  private stockMovementService = inject(StockMovementService);
  movements = this.stockMovementService.movements;

  ngOnInit() {
    this.stockMovementService.loadMovements();
  }
}
