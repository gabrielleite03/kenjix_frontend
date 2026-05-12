import { Component, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ProductService, Product } from '../product/product.service';
import { SalesService, SaleItem } from './sales.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { CategoryService, Category } from '../../services/category.service';

@Component({
  selector: 'app-pos',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, MatIconModule],
  templateUrl: './pos.html',
  styles: [`
    :host { display: block; }
    .no-scrollbar::-webkit-scrollbar { display: none; }
    .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Pos {
  private productService = inject(ProductService);
  private salesService = inject(SalesService);
  private CategoryService = inject(CategoryService);
  private router = inject(Router);
  categories = signal<Category[]>([]);

  searchControl = new FormControl('');
  discountControl = new FormControl(0);

  searchQuery = toSignal(this.searchControl.valueChanges, { initialValue: '' });
  discount = toSignal(this.discountControl.valueChanges, { initialValue: 0 });

  selectedCategory = signal<string>('Todos');
  paymentMethod = signal<'cash' | 'card' | 'pix'>('cash');
  cart = signal<SaleItem[]>([]);
  showSuccessModal = signal(false);

  constructor() {
    this.loadCategories();

    this.productService.loadProductsByFilter('site');
    console.log(this.productService.productsToHome());

    this.discountControl.valueChanges.subscribe(val => {
      const sub = this.subtotal();
      if (val !== null) {
        if (val < 0) this.discountControl.setValue(0, { emitEvent: false });
        if (val > sub) this.discountControl.setValue(sub, { emitEvent: false });
      }
    });
  }

  filteredProducts = computed(() => {
    let products = this.productService.productsToHome().filter(p => p.available);

    if (this.selectedCategory() !== 'Todos') {
      products = products.filter(p => p.category?.toString() === this.selectedCategory());
    }

    const query = this.searchQuery()?.toLowerCase();
    if (query) {
      products = products.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.sku.toLowerCase().includes(query)
      );
    }

    return products;
  });

  subtotal = computed(() => {
    return this.cart().reduce((acc, item) => acc + item.total, 0);
  });

  cartTotal = computed(() => {
    const total = this.subtotal() - (this.discount() || 0);
    return total > 0 ? total : 0;
  });

  addToCart(product: Product) {
    const stockQuantity = product.stockQuantity ?? 0;

    const price = Number(product.price);

    if (!Number.isFinite(price)) {
      console.error('Preço inválido ao adicionar no carrinho:', product);
      return;
    }

    if (stockQuantity <= 0) return;

    const existing = this.cart().find(item => item.productId === String(product.id));

    if (existing) {
      if (existing.quantity < stockQuantity) {
        this.updateQuantity(existing, 1);
      }
      return;
    }

    const newItem: SaleItem = {
      productId: String(product.id),
      productName: product.name,
      quantity: 1,
      price,
      total: price
    };

    this.cart.update(items => [...items, newItem]);
  }

  updateQuantity(item: SaleItem, delta: number) {
    const product = this.productService.getProductToHome(item.productId);
    if (!product) return;

    const newQty = item.quantity + delta;
    const price = Number(item.price);

    if (!Number.isFinite(price)) {
      console.error('Preço inválido no item do carrinho:', item);
      return;
    }

    if (newQty > 0 && newQty <= (product.stockQuantity ?? 0)) {
      this.cart.update(items => items.map(i =>
        i.productId === item.productId
          ? { ...i, quantity: newQty, total: newQty * price }
          : i
      ));
    }
  }

  removeFromCart(item: SaleItem) {
    this.cart.update(items => items.filter(i => i.productId !== item.productId));
  }

  getProductStock(id: string): number {
    return this.productService.getProductToHome(id)?.stockQuantity || 0;
  }

  finalizeSale() {
    if (this.cart().length === 0) return;

    this.salesService.createSale({
      items: this.cart(),
      subtotal: this.subtotal(),
      discount: this.discount() || 0,
      total: this.cartTotal(),
      paymentMethod: this.paymentMethod()
    });

    this.showSuccessModal.set(true);
  }

  closeModal() {
    this.showSuccessModal.set(false);
    this.cart.set([]);
    this.searchControl.setValue('');
    this.discountControl.setValue(0);
  }

  loadCategories() {
    this.CategoryService.findAll()
      .subscribe({
        next: (data) => {
          this.categories.set(data);
        },
        error: (err) => {
          console.error('Erro ao carregar categorias', err);
        }
      });
  }
}
