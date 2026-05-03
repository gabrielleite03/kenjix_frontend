import { ChangeDetectionStrategy, Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

import { ProductMarketplaceService } from './product-marketplace.service';
import { ProductService } from '../product/product.service';
import { MarketplacesService } from '../../services/marketplaces.service';
import { NotificationService } from '../../shared/services/notification';

import { MarketplaceProductDisplay, ProductMarketplace } from './product-marketplace.model';

@Component({
  selector: 'app-product-marketplaces',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule],
  templateUrl: './product-marketplaces.html',
  styleUrls: ['./product-marketplaces.css', '../admin-shared.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductMarketplaces implements OnInit {

  private fb = inject(FormBuilder);
  private pmService = inject(ProductMarketplaceService);
  private productService = inject(ProductService);
  private marketplacesService = inject(MarketplacesService);
  private notificationService = inject(NotificationService);

  ngOnInit() {
    this.productService.loadProducts();
    this.marketplacesService.loadMarketplaces();
    this.pmService.loadProductsMarketplaces();
  }

  displayProducts = this.pmService.displayProducts;
  products = this.productService.products;
  marketplaces = this.marketplacesService.marketplaces;

  searchTerm = signal('');
  isFormVisible = signal(false);
  editingItem = signal<MarketplaceProductDisplay | null>(null);

  filteredItems = computed(() => {
    const term = this.searchTerm().toLowerCase();

    return this.displayProducts().filter(item =>
      item.productName.toLowerCase().includes(term) ||
      item.marketplaceName.toLowerCase().includes(term) ||
      item.externalId?.toLowerCase().includes(term) ||
      item.productSku.toLowerCase().includes(term)
    );
  });

  marketplaceForm = this.fb.group({
    productId: this.fb.control<number>(0, Validators.required),
    marketplaceId: this.fb.control<number>(0, Validators.required),
    externalId: this.fb.control<string>(''),
    productUrl: this.fb.control<string>('', Validators.required),
    price: this.fb.control<number>(0),
    listingType: this.fb.control<string>(''),
    status: this.fb.control<string>('active'),
    active: this.fb.control<boolean>(true)
  });

  showForm(item?: MarketplaceProductDisplay) {
    if (item) {
      this.editingItem.set(item);

      this.marketplaceForm.patchValue({
        productId: item.productId,
        marketplaceId: item.marketplaceId,
        externalId: item.externalId || '',
        productUrl: item.productUrl,
        price: item.price || 0,
        listingType: item.listingType || '',
        status: item.status || 'active',
        active: item.active
      });

    } else {
      this.editingItem.set(null);

      this.marketplaceForm.reset({
        productId: 0,
        marketplaceId: 0,
        status: 'active',
        active: true,
        price: 0
      });
    }

    this.isFormVisible.set(true);
  }

  cancelForm() {
    this.isFormVisible.set(false);
    this.editingItem.set(null);
  }

  save() {
    if (this.marketplaceForm.invalid) return;

    const val = this.marketplaceForm.value;

    const data: Omit<ProductMarketplace, 'id' | 'createdAt' | 'updatedAt'> = {
      productId: Number(val.productId),
      marketplaceId: Number(val.marketplaceId),
      externalId: val.externalId || undefined,
      productUrl: val.productUrl!,
      price: val.price || undefined,
      listingType: val.listingType || undefined,
      status: val.status || 'active',
      active: val.active ?? true
    };

    const editing = this.editingItem();

    if (editing) {
      this.pmService.updateProductMarketplace(String(editing.id), data).subscribe({
        next: () => {
          this.notificationService.success('Product Marketplace atualizado com sucesso!');
          this.cancelForm();
          this.pmService.loadProductsMarketplaces();
        },
        error: (err) => {
          console.error(err);
          this.notificationService.error('Erro ao atualizar Product Marketplace');
        }
      });

    } else {
      this.pmService.addProductMarketplace(data).subscribe({
        next: () => {
          this.notificationService.success('Product Marketplace criado com sucesso!');
          this.cancelForm();
          this.pmService.loadProductsMarketplaces();
        },
        error: (err) => {
          console.error(err);
          this.notificationService.error('Erro ao criar Product Marketplace');
        }
      });
    }
  }

  deleteItem(id: string) {
    if (confirm('Deseja realmente remover este vínculo de marketplace?')) {

      this.pmService.deleteProductMarketplace(id).subscribe({
        next: () => {
          this.notificationService.success('Product Marketplace removido com sucesso!');
          this.pmService.loadProductsMarketplaces();
        },
        error: (err) => {
          console.error(err);
          this.notificationService.error('Erro ao remover Product Marketplace');
        }
      });

    }
  }

  toggleActive(item: MarketplaceProductDisplay) {
    this.pmService.updateProductMarketplace(String(item.id), {
      active: !item.active
    }).subscribe({
      next: () => {
        this.notificationService.success(`Product Marketplace ${!item.active ? 'ativado' : 'desativado'}!`);
        this.pmService.loadProductsMarketplaces();
      },
      error: (err) => {
        console.error(err);
        this.notificationService.error('Erro ao atualizar status do Product Marketplace');
      }
    });
  }
}