import { Injectable, signal, inject } from '@angular/core';
import { ProductService } from '../product/product.service';
import { StockMovementService } from '../product/stock-movement.service';
import { environment } from '../../../../src/environment';
import { HttpClient } from '@angular/common/http';

export interface PurchaseItem {
  productId: string;
  productName: string;
  quantity: number;
  costPrice: number;
  total: number;
  costCenter?: string;
}

export interface Purchase {
  id: string;
  invoiceNumber?: string;
  invoiceType: 'Integral' | 'Baixa';
  supplierId: string;
  supplierName: string;
  items: PurchaseItem[];
  total: number;
  status: 'Recebido' | 'Pendente' | 'Cancelado';
  createdAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class PurchasesService {
  constructor(private http: HttpClient) { }
  private API = `${environment.API_URL}/purchases`;
  private productService = inject(ProductService);
  private stockMovementService = inject(StockMovementService);
  private purchasesSignal = signal<Purchase[]>([]);

  getAll() {
    const token = localStorage.getItem('kenji_token');
    return this.http.get<Purchase[]>(`${this.API}`,{
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
        }
    });
  }

  getPurchaseById(id: string) {
     const token = localStorage.getItem('kenji_token');
    return this.http.get<Purchase>(`${this.API}/purchases/${id}`);
  }

  createPurchase(data: any) {
     const token = localStorage.getItem('kenji_token');
    return this.http.post(`${this.API}`, data);
  }

  updatePurchase(id: string, data: any) {
     const token = localStorage.getItem('kenji_token');
    return this.http.put(`${this.API}/${id}`, data);
  }
}
