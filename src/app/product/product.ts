import { ChangeDetectionStrategy, Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { WhatsAppButton } from '../whatsapp-button';
import { Header } from '../header/header';
import { Footer } from '../footer/footer';
import { ProductService, Product } from '../services/product.service';

@Component({
  selector: 'app-product-page',
  standalone: true,
  imports: [CommonModule, MatIconModule, WhatsAppButton, Header, Footer],
  templateUrl: './product.html',
  styleUrl: './product.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductPage implements OnInit {
  Math = Math;
  private productService = inject(ProductService);
  
  // Use a local signal to allow updates (like image carousel)
  products = signal<Product[]>([]);

  categories = ['Alimentação', 'Brinquedos', 'Acessórios', 'Dormitório', 'Passeio', 'Higiene', 'Viagem'];
  brands = ['Royal Canin', 'Purina', 'Kong', 'Zeedog', 'Petz', 'Kenji Premium'];

  // Pagination state
  currentPage = signal(1);
  itemsPerPage = 6;

  totalPages = computed(() => Math.ceil(this.products().length / this.itemsPerPage));

  paginatedProducts = computed(() => {
    const startIndex = (this.currentPage() - 1) * this.itemsPerPage;
    return this.products().slice(startIndex, startIndex + this.itemsPerPage);
  });

  ngOnInit() {
    this.loadProducts();
  }

  async loadProducts() {
    await this.productService.fetchProducts();
    this.products.set(this.productService.products());
  }

  setPage(page: number) {
    this.currentPage.set(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  nextPage() {
    if (this.currentPage() < this.totalPages()) {
      this.setPage(this.currentPage() + 1);
    }
  }

  prevPage() {
    if (this.currentPage() > 1) {
      this.setPage(this.currentPage() - 1);
    }
  }

  nextImage(productId: number, event: Event) {
    event.stopPropagation();
    this.products.update(prods => prods.map(p => {
      if (p.id === productId) {
        const next = (p.currentIndex + 1) % p.images.length;
        return { ...p, currentIndex: next };
      }
      return p;
    }));
  }

  prevImage(productId: number, event: Event) {
    event.stopPropagation();
    this.products.update(prods => prods.map(p => {
      if (p.id === productId) {
        const prev = (p.currentIndex - 1 + p.images.length) % p.images.length;
        return { ...p, currentIndex: prev };
      }
      return p;
    }));
  }

  openImage(url: string) {
    window.open(url, '_blank');
  }
}
