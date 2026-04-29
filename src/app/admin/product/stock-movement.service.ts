import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../src/environment';

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  type: 'Entrada' | 'Saída' | 'Ajuste';
  quantity: number;
  reason: string;
  referenceId?: string;
  createdAt: Date;
  warehousePlace?: string;
}

export interface StockMovementApi {
  id: number;
  product: {
    id: number;
    name: string;
  };

  type: 'IN' | 'OUT' | 'ADJUSTMENT';
  quantity: number;

  reason?: string;
  reference_id?: number;
  created_at: string;

  warehouse_place?: {
    id: string;
    name: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class StockMovementService {

  private movementsSignal = signal<StockMovement[]>([]);
  movements = this.movementsSignal.asReadonly();

  private API = `${environment.API_URL}/stocks/movements`;

  constructor(private http: HttpClient) { }


  loadMovements() {
    this.http.get<StockMovementApi[]>(this.API)
      .subscribe({
        next: (data) => {
          const mapped = data.map(mapToStockMovement);
          this.movementsSignal.set(mapped);
        },
        error: (err) => {
          console.error(err);
        }
      });
  }

  addMovement(movement: Omit<StockMovement, 'id' | 'createdAt'>) {
    return this.http.post(this.API, movement)
      .subscribe({
        next: () => this.loadMovements(), // recarrega lista
        error: (err) => console.error(err)
      });
  }
}

function mapToStockMovement(api: StockMovementApi): StockMovement {
  return {
    id: api.id.toString(),
    productId: api.product?.id?.toString() ?? '',
    productName: api.product?.name ?? '',

    type: mapType(api.type),
    quantity: api.quantity,

    reason: api.reason ?? '',
    referenceId: api.reference_id?.toString(),

    createdAt: new Date(api.created_at),

    warehousePlace: api.warehouse_place?.name ?? '—'
  };
}

function mapType(type: 'IN' | 'OUT' | 'ADJUSTMENT'): 'Entrada' | 'Saída' | 'Ajuste' {
  switch (type) {
    case 'IN':
      return 'Entrada';
    case 'OUT':
      return 'Saída';
    case 'ADJUSTMENT':
      return 'Ajuste'; // ou trata diferente se quiser
    default:
      return 'Entrada';
  }
}