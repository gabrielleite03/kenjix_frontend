import {Injectable, signal} from '@angular/core';

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  type: 'Entrada' | 'Saída';
  quantity: number;
  reason: string;
  referenceId?: string;
  createdAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class StockMovementService {
  private movementsSignal = signal<StockMovement[]>([
    {
      id: 'M-001',
      productId: '1',
      productName: 'Ração Premium Adulto Frango',
      type: 'Entrada',
      quantity: 50,
      reason: 'Compra P-001',
      referenceId: 'P-001',
      createdAt: new Date(Date.now() - 86400000 * 2)
    },
    {
      id: 'M-002',
      productId: '1',
      productName: 'Ração Premium Adulto Frango',
      type: 'Saída',
      quantity: 1,
      reason: 'Venda S-001',
      referenceId: 'S-001',
      createdAt: new Date(Date.now() - 3600000)
    }
  ]);

  movements = this.movementsSignal.asReadonly();

  addMovement(movement: Omit<StockMovement, 'id' | 'createdAt'>) {
    const newMovement: StockMovement = {
      ...movement,
      id: `M-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      createdAt: new Date()
    };
    this.movementsSignal.update(movements => [newMovement, ...movements]);
  }
}
