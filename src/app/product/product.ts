import { ChangeDetectionStrategy, Component, signal, computed, inject, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { WhatsAppButton } from '../whatsapp-button';
import { HeroSlider } from '../hero-slider/hero-slider';
import { Header } from '../header/header';
import { Footer } from '../footer/footer';
import { ProductService, Product } from '../services/product.service';

@Component({
  selector: 'app-product-page',
  standalone: true,
  imports: [CommonModule, MatIconModule, WhatsAppButton, HeroSlider, Header, Footer],
  templateUrl: './product.html',
  styleUrl: './product.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductPage implements OnInit {
  Math = Math;
  private productService = inject(ProductService);
  private sanitizer = inject(DomSanitizer);
  
  isSidebarOpen = signal(false);

  // Use a local signal to allow updates (like image carousel)
  products = signal<Product[]>([]);

  categories = ['Alimentação', 'Brinquedos', 'Acessórios', 'Dormitório', 'Passeio', 'Higiene', 'Viagem'];
  brands = ['Royal Canin', 'Purina', 'Kong', 'Zeedog', 'Petz', 'Kenji Premium'];

  // Pagination state
  currentPage = signal(1);
  itemsPerPage = signal(6);

  totalPages = computed(() => Math.ceil(this.products().length / this.itemsPerPage()));

  paginatedProducts = computed(() => {
    const startIndex = (this.currentPage() - 1) * this.itemsPerPage();
    return this.products().slice(startIndex, startIndex + this.itemsPerPage());
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
  }

  setItemsPerPage(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.itemsPerPage.set(Number(select.value));
    this.currentPage.set(1);
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

  openImage(url: string) {
    if (this.isYouTube(url)) return;
    window.open(url, '_blank');
  }

  isYouTube(url: string): boolean {
    return url.includes('youtube.com') || url.includes('youtu.be');
  }

  getYouTubeEmbedUrl(url: string): SafeResourceUrl {
    let videoId = '';
    if (url.includes('youtube.com/watch?v=')) {
      videoId = url.split('v=')[1].split('&')[0];
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1].split('?')[0];
    } else if (url.includes('youtube.com/embed/')) {
      videoId = url.split('embed/')[1].split('?')[0];
    }
    
    const embedUrl = `https://www.youtube.com/embed/${videoId}`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
  }

  getYouTubeThumbnail(url: string): string {
    let videoId = '';
    if (url.includes('youtube.com/watch?v=')) {
      videoId = url.split('v=')[1].split('&')[0];
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1].split('?')[0];
    } else if (url.includes('youtube.com/embed/')) {
      videoId = url.split('embed/')[1].split('?')[0];
    }
    return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  }
}
