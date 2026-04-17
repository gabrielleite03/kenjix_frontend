import { ChangeDetectionStrategy, Component, signal, computed, inject, OnInit, CUSTOM_ELEMENTS_SCHEMA, DestroyRef, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { WhatsAppButton } from '../whatsapp-button';
import { HeroSlider } from '../hero-slider/hero-slider';
import { Header } from '../header/header';
import { Footer } from '../footer/footer';
import { ProductService, Product } from '../admin/product/product.service';
import { MarketplacesService } from '../services/marketplaces.service';

@Component({
  selector: 'app-product-page',
  standalone: true,
  imports: [CommonModule, MatIconModule, WhatsAppButton, HeroSlider, Header, Footer],
  templateUrl: './product.html',
  styleUrl: './product.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductPage {

  Math = Math;
  private productService = inject(ProductService);
  private sanitizer = inject(DomSanitizer);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  private marketplaceService = inject(MarketplacesService);

  isSidebarOpen = signal(false);
  isLoading = signal(true);

  // Lista original (NÃO FILTRAR DIRETO)
  products = signal<Product[]>([]);

  // filtros
  selectedBrands = signal<string[]>([]);
  selectedCategories = signal<string[]>([]);
  priceRange = signal<{ min: number; max: number }>({ min: 0, max: 500 });

  marketplace = computed(() => {
    const selected = this.marketplaceService.selectedMarketplace();

    return selected?.name || 'site';
  });

  // 🔥 brands dinâmicas (sem duplicidade)
  brands = computed(() => {
    return [
      ...new Set(
        this.products()
          .map(p => p.brand?.trim().toLowerCase())
          .filter(Boolean)
      )
    ].map(b => b.charAt(0).toUpperCase() + b.slice(1));
  });

  // 🔥 produtos filtrados
  private normalize(value?: string): string {
    return value?.trim().toLowerCase() || '';
  }

  filteredProducts = computed(() => {
    let result = this.products();

    const selectedBrands = this.selectedBrands().map(b => this.normalize(b));
    const selectedCategories = this.selectedCategories().map(c => this.normalize(c));
    const maxPrice = this.maxPrice();

    // marca
    if (selectedBrands.length > 0) {
      result = result.filter(p =>
        selectedBrands.includes(this.normalize(p.brand))
      );
    }

    // categoria
    if (selectedCategories.length > 0) {
      result = result.filter(p =>
        selectedCategories.includes(this.normalize(p.category))
      );
    }

    // 🔥 preço (mesmo comportamento)
    result = result.filter(p =>
      Number(p.price) <= maxPrice
    );

    return result;
  });


  // paginação
  currentPage = signal(1);
  itemsPerPage = signal(20);
  maxPrice = signal(500);

  totalPages = computed(() =>
    Math.ceil(this.filteredProducts().length / this.itemsPerPage())
  );

  paginatedProducts = computed(() => {
    const startIndex = (this.currentPage() - 1) * this.itemsPerPage();
    return this.filteredProducts().slice(startIndex, startIndex + this.itemsPerPage());
  });

  categories = computed(() => {
    return [
      ...new Set(
        this.products()
          .map(p => p.category?.trim())
          .filter(Boolean)
      )
    ];
  });

  constructor() {
  effect(() => {
    const marketplace = this.marketplaceService.selectedMarketplace();
    const trigger = this.marketplaceService.reloadTrigger(); // 👈 chave

    if (!marketplace) return;

    this.loadProducts();
  });
}

  async loadProducts() {
    this.isLoading.set(true);

    this.productService.getProductsByFilter({
      marketplace: this.marketplace()
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (productsList) => {
          this.products.set(productsList);
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('Erro ao carregar produtos', err);
          this.isLoading.set(false);
        }
      });
  }

  updatePriceFilter(event: any) {
    const value = Number(event.target.value);

    this.maxPrice.set(value);
    this.currentPage.set(1);
  }

  // filtro de marca
  onBrandChange(brand: string, checked: boolean) {
    if (checked) {
      this.selectedBrands.update(brands => {
        if (brands.includes(brand)) return brands;
        return [...brands, brand];
      });
    } else {
      this.selectedBrands.update(brands => brands.filter(b => b !== brand));
    }

    this.currentPage.set(1);
  }

  // filtros adicionais (mantidos)
  onCategoryChange(category: string, checked: boolean) {
    if (checked) {
      this.selectedCategories.update(cats => {
        if (cats.includes(category)) return cats;
        return [...cats, category];
      });
    } else {
      this.selectedCategories.update(cats =>
        cats.filter(c => c !== category)
      );
    }

    this.currentPage.set(1);
  }

  onPriceChange(event: any) {
    const value = Number(event.target.value);

    this.priceRange.update(range => ({
      ...range,
      max: value
    }));

    this.currentPage.set(1);
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

  goToDetail(id: number) {
    this.router.navigate(['/produto', id]);
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