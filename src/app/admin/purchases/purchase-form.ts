import {Component, inject, signal, computed, ChangeDetectionStrategy} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Router, RouterLink} from '@angular/router';
import {FormsModule, ReactiveFormsModule, FormBuilder, Validators, FormArray} from '@angular/forms';
import {MatIconModule} from '@angular/material/icon';
import {ProductService} from '../product/product.service';
import {PurchasesService, PurchaseItem} from './purchases.service';

@Component({
  selector: 'app-purchase-form',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ReactiveFormsModule, MatIconModule],
  template: `
    <div class="p-4 lg:p-8 max-w-5xl mx-auto space-y-6">
      <div class="flex items-center gap-4">
        <a routerLink="/admin/purchases" class="p-2 hover:bg-slate-100 rounded-full transition-colors">
          <mat-icon>arrow_back</mat-icon>
        </a>
        <h1 class="text-2xl font-black text-slate-800 tracking-tight">Nova Compra</h1>
      </div>

      <form [formGroup]="purchaseForm" (ngSubmit)="savePurchase()" class="space-y-6">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Main Form -->
          <div class="lg:col-span-2 space-y-6">
            <section class="bg-white rounded-2xl mat-shadow p-6 border border-slate-100">
              <div class="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
                <mat-icon class="text-primary">local_shipping</mat-icon>
                <h3 class="font-bold text-slate-800">Dados do Fornecedor</h3>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label class="mat-label" for="supplier">Fornecedor</label>
                  <select class="mat-input-field" id="supplier" formControlName="supplierId">
                    <option value="">Selecione um fornecedor</option>
                    <option value="1">PetFood Distribuidora</option>
                    <option value="2">CleanPet Higiene</option>
                    <option value="4">MedVet Medicamentos</option>
                  </select>
                </div>
                <div>
                  <label class="mat-label" for="invoiceNumber">Número da Nota Fiscal</label>
                  <input type="text" class="mat-input-field" id="invoiceNumber" formControlName="invoiceNumber" placeholder="Ex: NF-12345">
                </div>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="mat-label" for="invoiceType">Tipo de Nota</label>
                  <select class="mat-input-field" id="invoiceType" formControlName="invoiceType">
                    <option value="Integral">Integral</option>
                    <option value="Baixa">Baixa</option>
                  </select>
                </div>
                <div>
                  <label class="mat-label" for="status">Status do Pedido</label>
                  <select class="mat-input-field" id="status" formControlName="status">
                    <option value="Pendente">Pendente</option>
                    <option value="Recebido">Recebido (Atualiza Estoque)</option>
                    <option value="Cancelado">Cancelado</option>
                  </select>
                </div>
              </div>
            </section>

            <section class="bg-white rounded-2xl mat-shadow p-6 border border-slate-100">
              <div class="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
                <div class="flex items-center gap-2">
                  <mat-icon class="text-primary">inventory_2</mat-icon>
                  <h3 class="font-bold text-slate-800">Itens da Compra</h3>
                </div>
                <button type="button" (click)="addItem()" class="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                  <mat-icon class="text-sm">add</mat-icon>
                  Adicionar Item
                </button>
              </div>

              <div formArrayName="items" class="space-y-4">
                @for (item of items.controls; track i; let i = $index) {
                  <div [formGroupName]="i" class="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 bg-slate-50 rounded-xl relative group">
                    <div class="md:col-span-5">
                      <span class="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Produto</span>
                      <select class="mat-input-field text-sm" formControlName="productId">
                        <option value="">Selecione o produto</option>
                        @for (p of products(); track p.id) {
                          <option [value]="p.id">{{ p.name }} ({{ p.sku }})</option>
                        }
                      </select>
                    </div>
                    <div class="md:col-span-2">
                      <span class="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Qtd</span>
                      <input type="number" class="mat-input-field text-sm" formControlName="quantity">
                    </div>
                    <div class="md:col-span-2">
                      <span class="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Custo Unit.</span>
                      <input type="number" class="mat-input-field text-sm" formControlName="costPrice">
                    </div>
                    <div class="md:col-span-2">
                      <span class="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Total</span>
                      <div class="h-10 flex items-center font-bold text-slate-700">
                        R$ {{ calculateItemTotal(i) | number:'1.2-2' }}
                      </div>
                    </div>
                    <div class="md:col-span-1 flex items-end justify-end pb-1">
                      <button type="button" (click)="removeItem(i)" class="p-2 text-slate-300 hover:text-rose-500 transition-colors">
                        <mat-icon>delete</mat-icon>
                      </button>
                    </div>
                  </div>
                } @empty {
                  <div class="text-center py-8 text-slate-400 italic text-sm">
                    Nenhum item adicionado. Clique em "Adicionar Item" para começar.
                  </div>
                }
              </div>
            </section>
          </div>

          <!-- Sidebar Summary -->
          <div class="lg:col-span-1">
            <div class="sticky top-24 space-y-6">
              <section class="bg-white rounded-2xl mat-shadow p-6 border border-slate-100">
                <h3 class="font-bold text-slate-800 mb-4">Resumo Financeiro</h3>
                <div class="space-y-3">
                  <div class="flex justify-between text-sm text-slate-500">
                    <span>Subtotal</span>
                    <span>R$ {{ total() | number:'1.2-2' }}</span>
                  </div>
                  <div class="flex justify-between text-xl font-black text-slate-800 pt-3 border-t border-slate-100">
                    <span>Total</span>
                    <span>R$ {{ total() | number:'1.2-2' }}</span>
                  </div>
                </div>
                <button 
                  type="submit" 
                  [disabled]="purchaseForm.invalid || items.length === 0"
                  class="w-full mt-6 py-3 bg-primary text-white rounded-xl font-bold mat-shadow hover:brightness-105 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale disabled:scale-100"
                >
                  Confirmar Compra
                </button>
                <button type="button" routerLink="/admin/purchases" class="w-full mt-2 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition-all">
                  Cancelar
                </button>
              </section>

              <div class="p-4 bg-amber-50 border border-amber-200 rounded-xl flex gap-3">
                <mat-icon class="text-amber-500">info</mat-icon>
                <p class="text-[11px] text-amber-700 leading-relaxed">
                  Ao definir o status como <strong>"Recebido"</strong>, o estoque dos produtos selecionados será incrementado automaticamente e o preço de custo será atualizado.
                </p>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  `,
  styles: [`
    :host { display: block; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PurchaseForm {
  private fb = inject(FormBuilder);
  private productService = inject(ProductService);
  private purchasesService = inject(PurchasesService);
  private router = inject(Router);

  products = this.productService.products;

  purchaseForm = this.fb.group({
    supplierId: ['', Validators.required],
    invoiceNumber: [''],
    invoiceType: ['Integral', Validators.required],
    status: ['Pendente', Validators.required],
    items: this.fb.array([])
  });

  get items() {
    return this.purchaseForm.get('items') as FormArray;
  }

  total = computed(() => this._total());

  constructor() {
    // Initial item
    this.addItem();
    
    // Total calculation
    this.purchaseForm.valueChanges.subscribe(() => {
      this.calculateTotal();
    });
  }

  private _total = signal(0);
  calculateTotal() {
    let sum = 0;
    for (let i = 0; i < this.items.length; i++) {
      sum += this.calculateItemTotal(i);
    }
    this._total.set(sum);
  }

  get totalValue() {
    return this._total();
  }

  addItem() {
    const itemForm = this.fb.group({
      productId: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      costPrice: [0, [Validators.required, Validators.min(0)]]
    });
    this.items.push(itemForm);
  }

  removeItem(index: number) {
    this.items.removeAt(index);
  }

  calculateItemTotal(index: number): number {
    const item = this.items.at(index).value;
    return (item.quantity || 0) * (item.costPrice || 0);
  }

  savePurchase() {
    if (this.purchaseForm.valid && this.items.length > 0) {
      const formValue = this.purchaseForm.value;
      
      // Find supplier name (mocked for now)
      const suppliers: Record<string, string> = {
        '1': 'PetFood Distribuidora',
        '2': 'CleanPet Higiene',
        '4': 'MedVet Medicamentos'
      };

      const purchaseItems: PurchaseItem[] = this.items.controls.map(ctrl => {
        const val = ctrl.value;
        const product = this.productService.getProductById(val.productId);
        return {
          productId: val.productId,
          productName: product?.name || 'Produto Desconhecido',
          quantity: val.quantity,
          costPrice: val.costPrice,
          total: val.quantity * val.costPrice
        };
      });

      this.purchasesService.createPurchase({
        supplierId: formValue.supplierId!,
        supplierName: suppliers[formValue.supplierId!] || 'Fornecedor',
        invoiceNumber: formValue.invoiceNumber || undefined,
        invoiceType: formValue.invoiceType as 'Integral' | 'Baixa',
        items: purchaseItems,
        total: this._total(),
        status: formValue.status as 'Recebido' | 'Pendente' | 'Cancelado'
      });

      this.router.navigate(['/admin/purchases']);
    }
  }
}
