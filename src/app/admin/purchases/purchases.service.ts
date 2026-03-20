import {Injectable, signal, inject} from '@angular/core';
import {ProductService} from '../product/product.service';
import {StockMovementService} from '../product/stock-movement.service';

export interface PurchaseItem {
  productId: string;
  productName: string;
  quantity: number;
  costPrice: number;
  total: number;
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
  private productService = inject(ProductService);
  private stockMovementService = inject(StockMovementService);
  private purchasesSignal = signal<Purchase[]>([
    {
      id: 'P-001',
      invoiceNumber: 'NF-12345',
      invoiceType: 'Integral',
      supplierId: '1',
      supplierName: 'PetFood Distribuidora',
      items: [
        { productId: '1', productName: 'Ração Premium Adulto Frango', quantity: 50, costPrice: 120.00, total: 6000.00 }
      ],
      total: 6000.00,
      status: 'Recebido',
      createdAt: new Date(Date.now() - 86400000 * 2) // 2 days ago
    }
  ]);

  purchases = this.purchasesSignal.asReadonly();

  createPurchase(purchaseData: Omit<Purchase, 'id' | 'createdAt'>) {
    const newPurchase: Purchase = {
      ...purchaseData,
      id: `P-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      createdAt: new Date()
    };

    // If status is 'Recebido', update stock
    if (newPurchase.status === 'Recebido') {
      this.updateStockFromPurchase(newPurchase);
    }

    this.purchasesSignal.update(purchases => [newPurchase, ...purchases]);
    return newPurchase;
  }

  private updateStockFromPurchase(purchase: Purchase) {
    purchase.items.forEach(item => {
      const product = this.productService.getProductById(item.productId);
      if (product) {
        this.productService.updateProduct(item.productId, {
          stock: product.stock + item.quantity,
          costPrice: item.costPrice // Update cost price to the latest purchase price
        });

        // Record stock movement
        this.stockMovementService.addMovement({
          productId: item.productId,
          productName: item.productName,
          type: 'Entrada',
          quantity: item.quantity,
          reason: `Compra ${purchase.id}`,
          referenceId: purchase.id
        });
      }
    });
  }
}
