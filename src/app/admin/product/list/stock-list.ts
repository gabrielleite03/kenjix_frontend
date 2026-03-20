import {ChangeDetectionStrategy, Component, inject, computed} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatIconModule} from '@angular/material/icon';
import {FormControl, ReactiveFormsModule} from '@angular/forms';
import {ProductService} from '../product.service';
import {toSignal} from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-stock-list',
  standalone: true,
  imports: [CommonModule, MatIconModule, ReactiveFormsModule],
  templateUrl: './stock-list.html',
  styleUrls: ['./stock-list.css', '../../admin-shared.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StockList {
  productService = inject(ProductService);
  
  searchControl = new FormControl('');
  categoryControl = new FormControl('');

  searchTerm = toSignal(this.searchControl.valueChanges, {initialValue: ''});
  selectedCategory = toSignal(this.categoryControl.valueChanges, {initialValue: ''});

  products = computed(() => {
    const allProducts = this.productService.products();
    const search = (this.searchTerm() || '').toLowerCase();
    const category = this.selectedCategory() || '';

    return allProducts.filter(p => {
      const matchesSearch = !search || 
        p.name.toLowerCase().includes(search) || 
        p.sku.toLowerCase().includes(search) || 
        p.brand.toLowerCase().includes(search);
      
      const matchesCategory = !category || p.category === category;

      return matchesSearch && matchesCategory;
    });
  });

  categories = computed(() => {
    const allProducts = this.productService.products();
    const cats = new Set(allProducts.map(p => p.category));
    return Array.from(cats).sort();
  });

  clearFilters() {
    this.searchControl.setValue('');
    this.categoryControl.setValue('');
  }

  deleteProduct(id: string) {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
      this.productService.deleteProduct(id);
    }
  }
}
