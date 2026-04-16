import { Component, inject, signal, computed, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators, FormArray, FormGroup } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ProductService } from '../product/product.service';
import { PurchasesService } from './purchases.service';
import { SupplierService, Supplier } from '../suppliers/supplier.service';
import { CostCenterService, CostCenter } from '../../services/cost-center.service';
import { NotificationService } from '../../shared/services/notification';

@Component({
  selector: 'app-purchase-form',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ReactiveFormsModule, MatIconModule],
  templateUrl: `purchase-form.html`,
  styleUrl: './purchases.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PurchaseForm implements OnInit {

  private fb = inject(FormBuilder);
  private productService = inject(ProductService);
  private purchasesService = inject(PurchasesService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private supplierService = inject(SupplierService);
  private costCenterService = inject(CostCenterService);
  private notificationService = inject(NotificationService);

  suppliers = signal<Supplier[]>([]);
  costCenters = signal<CostCenter[]>([]);

  products = this.productService.products;

  isEditing = false;
  editingId: string | null = null;

  private _total = signal(0);
  total = computed(() => this._total());

  loading = signal(true);

  purchaseForm = this.fb.group({
    supplierId: ['', Validators.required],
    invoiceNumber: [''],
    invoiceType: ['Integral', Validators.required],
    status: ['Pendente', Validators.required],
    items: this.fb.array([])
  });

  constructor() {
    this.editingId = this.route.snapshot.paramMap.get('id');

    if (this.editingId) {
      this.isEditing = true;
    } else {
      this.addItem();
    }

    this.purchaseForm.valueChanges.subscribe(() => {
      this.calculateTotal();
    });
  }

  ngOnInit() {
    this.loadSuppliers();
    this.loadCostCenters();
    this.productService.loadProducts();

    if (this.editingId) {
      this.loadPurchase(this.editingId);
    }
  }

  // =========================
  // FORM ARRAY
  // =========================

  get items() {
    return this.purchaseForm.get('items') as FormArray;
  }

  addItem() {
    const itemForm = this.fb.group({
      productId: ['', Validators.required],
      costCenter: [null, Validators.required], // ✅ FIX PRINCIPAL
      quantity: [1, [Validators.required, Validators.min(1)]],
      costPrice: [0, [Validators.required, Validators.min(0)]]
    });

    this.items.push(itemForm);
  }

  removeItem(index: number) {
    this.items.removeAt(index);
  }

  // =========================
  // LOAD PURCHASE (EDIT)
  // =========================

  private loadPurchase(id: string) {
    this.purchasesService.getPurchaseById(id)
      .subscribe({
        next: (purchase) => {

          this.purchaseForm.patchValue({
            supplierId: purchase.supplierId,
            invoiceNumber: purchase.invoiceNumber || '',
            invoiceType: purchase.invoiceType,
            status: purchase.status
          });

          while (this.items.length) {
            this.items.removeAt(0);
          }

          purchase.items.forEach((item: any) => {

            this.items.push(
              this.fb.group({
                productId: [item.productId, Validators.required],
                costCenter: [item.costCenterId ?? null, Validators.required], // ✅ FIX
                quantity: [item.quantity, [Validators.required, Validators.min(1)]],
                costPrice: [item.costPrice, [Validators.required, Validators.min(0)]]
              })
            );
          });

          this.calculateTotal();
        },
        error: () => {
          this.router.navigate(['/admin/purchases']);
        }
      });
  }

  // =========================
  // TOTAL
  // =========================

  calculateTotal() {
    let sum = 0;

    for (let i = 0; i < this.items.length; i++) {
      sum += this.calculateItemTotal(i);
    }

    this._total.set(sum);
  }

  calculateItemTotal(index: number): number {
    const item = this.items.at(index).value;
    return (item.quantity || 0) * (item.costPrice || 0);
  }

  // =========================
  // SAVE
  // =========================

  savePurchase() {
    if (this.purchaseForm.invalid || this.items.length === 0) return;

    const formValue = this.purchaseForm.getRawValue();

    const purchaseItems = this.items.controls.map(ctrl => {
      const val = (ctrl as FormGroup).getRawValue();

      return {
        productId: Number(val.productId),
        quantity: Number(val.quantity),
        costPrice: Number(val.costPrice),
        costCenterId: val.costCenter !== null ? Number(val.costCenter) : null
      };
    });

    const payload = {
      supplierId: formValue.supplierId,
      invoiceNumber: formValue.invoiceNumber || null,
      invoiceType: formValue.invoiceType,
      status: formValue.status,
      items: purchaseItems
    };

    if (this.isEditing && this.editingId) {

      this.purchasesService.updatePurchase(this.editingId, payload)
        .subscribe({
          next: () => {
            this.notificationService.success('Compra atualizada com sucesso!');
            this.router.navigate(['/admin/purchases']);
          },
          error: (err) => {
            let message = 'Erro inesperado no servidor';

            if (typeof err?.error === 'string') {
              message = err.error;
            } else if (err?.error?.message) {
              message = err.error.message;
            }

            this.notificationService.error(message);
          }
        });

    } else {

      this.purchasesService.createPurchase(payload)
        .subscribe({
          next: () => {
            this.notificationService.success('Compra criada com sucesso!');
            this.router.navigate(['/admin/purchases']);
          },
          error: (err) => {
            let message = 'Erro inesperado no servidor';

            if (typeof err?.error === 'string') {
              message = err.error;
            } else if (err?.error?.message) {
              message = err.error.message;
            }

            this.notificationService.error(message);
          }
        });
    }
  }

  // =========================
  // LOAD DATA
  // =========================

  loadSuppliers() {
    this.loading.set(true);

    this.supplierService.getSuppliers()
      .subscribe({
        next: (data) => {
          this.suppliers.set(data);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
        }
      });
  }

  loadCostCenters() {
    this.costCenterService.findAll()
      .subscribe({
        next: (data) => {
          this.costCenters.set(data);
        },
        error: (err) => {
          console.error('Erro ao carregar centros de custo', err);
        }
      });
  }
}