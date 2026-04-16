import {Component, inject, signal, computed, ChangeDetectionStrategy} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Router, RouterLink} from '@angular/router';
import {FormControl, ReactiveFormsModule} from '@angular/forms';
import {MatIconModule} from '@angular/material/icon';
import {ProductService, ProductItem} from '../product/product.service';
import {SalesService, SaleItem} from './sales.service';
import {toSignal} from '@angular/core/rxjs-interop';
import { CategoryService,  Category } from '../../services/category.service';

@Component({
  selector: 'app-pos',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, MatIconModule],
  template: `
    <div class="h-[calc(100vh-64px)] flex flex-col lg:flex-row overflow-hidden bg-slate-50">
      <!-- Left side: Product Selection -->
      <div class="flex-1 flex flex-col min-h-0 border-r border-slate-200">
        <div class="p-4 bg-white border-b border-slate-200 flex items-center gap-4">
          <a routerLink="/admin/sales" class="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <mat-icon>arrow_back</mat-icon>
          </a>
          <div class="relative flex-1">
            <mat-icon class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</mat-icon>
            <input 
              type="text" 
              [formControl]="searchControl" 
              placeholder="Buscar produto por nome ou SKU..." 
              class="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-xl focus:ring-2 focus:ring-primary/20 transition-all"
            >
          </div>
          <div class="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap mr-2 border-r border-slate-200 pr-4">Categorias</span>
            @for (cat of categories(); track cat) {
              <button 
                (click)="selectedCategory.set(cat.id === '0' ? 'Todos' : cat.id.toString())"
                [class.bg-primary]="selectedCategory() === cat.id.toString()"
                [class.text-white]="selectedCategory() === cat.id.toString()"
                [class.bg-white]="selectedCategory() !== cat.id.toString()"
                [class.text-slate-600]="selectedCategory() !== cat.id.toString()"
                class="px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap mat-shadow-sm border border-slate-100 transition-all"
              >
                {{ cat }}
              </button>
            }
          </div>
        </div>

        <div class="flex-1 overflow-y-auto p-4 lg:p-6">
          <div class="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
            @for (product of filteredProducts(); track product.id) {
              <button 
                (click)="addToCart(product)"
                [disabled]="product.stock <= 0"
                class="bg-white p-3 rounded-2xl mat-shadow-sm border border-slate-100 hover:border-primary hover:scale-[1.02] active:scale-95 transition-all text-left group disabled:opacity-50 disabled:grayscale disabled:scale-100"
              >
                <div class="aspect-square rounded-xl bg-slate-100 mb-3 overflow-hidden relative">
                  <img [src]="product.images[0]" [alt]="product.name" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" referrerpolicy="no-referrer">
                  @if (product.stock <= 0) {
                    <div class="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <span class="text-[10px] font-black text-white uppercase tracking-widest bg-rose-500 px-2 py-1 rounded">Esgotado</span>
                    </div>
                  }
                </div>
                <p class="text-[10px] font-bold text-primary uppercase tracking-wider mb-1">{{ product.category }}</p>
                <h4 class="text-sm font-bold text-slate-800 leading-tight line-clamp-2 mb-2">{{ product.name }}</h4>
                <div class="flex items-center justify-between mt-auto">
                  <span class="text-sm font-black text-slate-900">R$ {{ product.sellingPrice | number:'1.2-2' }}</span>
                  <span class="text-[10px] font-bold text-slate-400">{{ product.stock }} un.</span>
                </div>
              </button>
            }
          </div>
        </div>
      </div>

      <!-- Right side: Cart & Checkout -->
      <div class="w-full lg:w-[400px] bg-white flex flex-col mat-shadow-lg z-10">
        <div class="p-6 border-b border-slate-100">
          <h3 class="text-lg font-black text-slate-800 flex items-center gap-2">
            <mat-icon class="text-primary">shopping_basket</mat-icon>
            Carrinho
          </h3>
        </div>

        <div class="flex-1 overflow-y-auto p-6 space-y-4">
          @for (item of cart(); track item.productId) {
            <div class="flex items-center gap-3 group">
              <div class="flex-1">
                <h5 class="text-sm font-bold text-slate-800 leading-tight">{{ item.productName }}</h5>
                <p class="text-xs text-slate-400">R$ {{ item.price | number:'1.2-2' }} x {{ item.quantity }}</p>
              </div>
              <div class="flex items-center gap-2 bg-slate-100 rounded-lg p-1">
                <button (click)="updateQuantity(item, -1)" class="w-6 h-6 flex items-center justify-center hover:bg-white rounded transition-colors">
                  <mat-icon class="text-sm">remove</mat-icon>
                </button>
                <span class="text-xs font-bold w-4 text-center">{{ item.quantity }}</span>
                <button (click)="updateQuantity(item, 1)" class="w-6 h-6 flex items-center justify-center hover:bg-white rounded transition-colors">
                  <mat-icon class="text-sm">add</mat-icon>
                </button>
              </div>
              <p class="text-sm font-black text-slate-800 w-20 text-right">R$ {{ item.total | number:'1.2-2' }}</p>
              <button (click)="removeFromCart(item)" class="p-1 text-slate-300 hover:text-rose-500 transition-colors">
                <mat-icon class="text-sm">delete</mat-icon>
              </button>
            </div>
          } @empty {
            <div class="h-full flex flex-col items-center justify-center text-slate-300 space-y-4">
              <mat-icon class="text-6xl">shopping_cart</mat-icon>
              <p class="font-bold italic">Carrinho vazio</p>
            </div>
          }
        </div>

        <div class="p-6 bg-slate-50 border-t border-slate-200 space-y-4">
          <div class="space-y-2">
            <div class="flex justify-between text-sm text-slate-500 font-bold">
              <span>Subtotal</span>
              <span>R$ {{ subtotal() | number:'1.2-2' }}</span>
            </div>
            <div class="flex items-center justify-between gap-4">
              <span class="text-sm text-slate-500 font-bold">Desconto</span>
              <div class="relative w-32">
                <span class="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">R$</span>
                <input 
                  type="number" 
                  [formControl]="discountControl" 
                  class="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-bold text-rose-500 focus:ring-2 focus:ring-rose-500/20 outline-none transition-all"
                >
              </div>
            </div>
            <div class="flex justify-between text-xl font-black text-slate-800 pt-2 border-t border-slate-200">
              <span>Total</span>
              <span>R$ {{ cartTotal() | number:'1.2-2' }}</span>
            </div>
          </div>

          <div class="space-y-3">
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Método de Pagamento</p>
            <div class="grid grid-cols-3 gap-2">
              <button 
                (click)="paymentMethod.set('cash')"
                [class]="(paymentMethod() === 'cash' ? 'border-primary bg-primary/5 ' : 'border-slate-200 ') + 'flex flex-col items-center justify-center p-3 rounded-xl border-2 hover:border-primary transition-all gap-1'"
              >
                <mat-icon class="text-slate-400" [class.text-primary]="paymentMethod() === 'cash'">payments</mat-icon>
                <span class="text-[10px] font-bold uppercase">Dinheiro</span>
              </button>
              <button 
                (click)="paymentMethod.set('card')"
                [class]="(paymentMethod() === 'card' ? 'border-primary bg-primary/5 ' : 'border-slate-200 ') + 'flex flex-col items-center justify-center p-3 rounded-xl border-2 hover:border-primary transition-all gap-1'"
              >
                <mat-icon class="text-slate-400" [class.text-primary]="paymentMethod() === 'card'">credit_card</mat-icon>
                <span class="text-[10px] font-bold uppercase">Cartão</span>
              </button>
              <button 
                (click)="paymentMethod.set('pix')"
                [class]="(paymentMethod() === 'pix' ? 'border-primary bg-primary/5 ' : 'border-slate-200 ') + 'flex flex-col items-center justify-center p-3 rounded-xl border-2 hover:border-primary transition-all gap-1'"
              >
                <mat-icon class="text-slate-400" [class.text-primary]="paymentMethod() === 'pix'">qr_code_2</mat-icon>
                <span class="text-[10px] font-bold uppercase">PIX</span>
              </button>
            </div>
          </div>

          <button 
            (click)="finalizeSale()"
            [disabled]="cart().length === 0"
            class="w-full py-4 bg-primary text-white rounded-2xl font-black text-lg mat-shadow hover:brightness-105 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale disabled:scale-100"
          >
            Finalizar Venda
          </button>
        </div>
      </div>
    </div>

    <!-- Success Modal -->
    @if (showSuccessModal()) {
      <div class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <div class="bg-white rounded-3xl p-8 max-w-sm w-full text-center space-y-6 mat-shadow-2xl animate-in zoom-in duration-300">
          <div class="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <mat-icon class="text-4xl">check_circle</mat-icon>
          </div>
          <div>
            <h3 class="text-2xl font-black text-slate-800">Venda Realizada!</h3>
            <p class="text-slate-500">O estoque foi atualizado com sucesso.</p>
          </div>
          <button (click)="closeModal()" class="w-full py-3 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-700 transition-colors">
            Continuar Vendendo
          </button>
        </div>
      </div>
    }
  `,
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
  
  searchQuery = toSignal(this.searchControl.valueChanges, {initialValue: ''});
  discount = toSignal(this.discountControl.valueChanges, {initialValue: 0});

  selectedCategory = signal<string>('Todos');
  paymentMethod = signal<'cash' | 'card' | 'pix'>('cash');
  cart = signal<SaleItem[]>([]);
  showSuccessModal = signal(false);

  constructor() {
    this.discountControl.valueChanges.subscribe(val => {
      const sub = this.subtotal();
      if (val !== null) {
        if (val < 0) this.discountControl.setValue(0, {emitEvent: false});
        if (val > sub) this.discountControl.setValue(sub, {emitEvent: false});
      }
    });
  }

  filteredProducts = computed(() => {
    let products = this.productService.products().filter(p => p.active);
    
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

  addToCart(product: ProductItem) {
    const existing = this.cart().find(item => item.productId === product.id);
    if (existing) {
      if (existing.quantity < product.stock) {
        this.updateQuantity(existing, 1);
      }
    } else {
      const newItem: SaleItem = {
        productId: product.id,
        productName: product.name,
        quantity: 1,
        price: product.sellingPrice,
        total: product.sellingPrice
      };
      this.cart.update(items => [...items, newItem]);
    }
  }

  updateQuantity(item: SaleItem, delta: number) {
    const product = this.productService.getProductById(item.productId);
    if (!product) return;

    const newQty = item.quantity + delta;
    if (newQty > 0 && newQty <= product.stock) {
      this.cart.update(items => items.map(i => 
        i.productId === item.productId 
          ? { ...i, quantity: newQty, total: newQty * i.price } 
          : i
      ));
    }
  }

  removeFromCart(item: SaleItem) {
    this.cart.update(items => items.filter(i => i.productId !== item.productId));
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
