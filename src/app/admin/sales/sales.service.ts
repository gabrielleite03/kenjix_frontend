import {Injectable, signal, inject} from '@angular/core';
import {ProductService} from '../product/product.service';
import {StockMovementService} from '../product/stock-movement.service';

export interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Sale {
  id: string;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: 'cash' | 'card' | 'pix';
  createdAt: Date;
  customerName?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SalesService {
  private productService = inject(ProductService);
  private stockMovementService = inject(StockMovementService);
  private salesSignal = signal<Sale[]>([
    {
      id: 'S-001',
      items: [
        { productId: '1', productName: 'Ração Premium Adulto Frango', quantity: 1, price: 189.90, total: 189.90 }
      ],
      subtotal: 189.90,
      discount: 0,
      total: 189.90,
      paymentMethod: 'pix',
      createdAt: new Date(Date.now() - 3600000),
      customerName: 'João Silva'
    }
  ]);

  sales = this.salesSignal.asReadonly();

  createSale(saleData: Omit<Sale, 'id' | 'createdAt'>) {
    const newSale: Sale = {
      ...saleData,
      id: `S-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      createdAt: new Date()
    };

    // Update stock for each product
    newSale.items.forEach(item => {
      const product = this.productService.getProductById(item.productId);
      if (product) {
        this.productService.updateProduct(item.productId, {
          stock: product.stock - item.quantity
        });

        // Record stock movement
        this.stockMovementService.addMovement({
          productId: item.productId,
          productName: item.productName,
          type: 'Saída',
          quantity: item.quantity,
          reason: `Venda ${newSale.id}`,
          referenceId: newSale.id
        });
      }
    });

    this.salesSignal.update(sales => [newSale, ...sales]);
    return newSale;
  }
}
