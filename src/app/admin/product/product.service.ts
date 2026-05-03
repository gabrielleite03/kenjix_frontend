import { Injectable, signal, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Category } from '../../services/category.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap, of } from 'rxjs';
import { environment } from '../../../../src/environment';
import { ProductMarketplace } from '../marketplaces/product-marketplace.model';

export interface ProductProperty {
  name: string;
  value: string;
}

export interface Video {
  id: number;
  productId: number;
  url: string;
}

export interface ProductItem {
  id: string;
  name: string;
  sku: string;
  category?: Category;
  brand: string;
  ean?: string | null;
  ncm?: string | null;
  weight: string;
  animalType: string;
  lifeStage: string;
  description: string;
  sellingPrice: number;
  price: number;
  stock: number;
  minStock: number;
  images: string[];
  active: boolean;
  createdAt: Date;
  volume?: number;
  videoUrl?: string;
  videos?: Video[];
  properties?: ProductProperty[];
  available: boolean;
  product_marketplaces?: ProductMarketplace[];
}

export interface Product {
  id: number;
  sku: string;
  name: string;
  description: string;
  category: string;
  brand: string;
  price: number;
  oldPrice?: number;
  rating: number;
  reviews: number;
  images: string[];
  currentIndex: number;
  available: boolean;
  product_marketplaces?: ProductMarketplace[];
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  private API = environment.API_URL;

  private productsSignal = signal<ProductItem[]>([]);
  products = this.productsSignal;

  private TTL = 5 * 60 * 1000; // 5 min
  private CACHE_KEY = 'products_cache';


  getProductById(id: string) {
    return this.productsSignal().find(p => p.id === id);
  }

  getProductToHomeById(id: string, marketplace?: string) {
    let params = new HttpParams();

    if (marketplace) {
      params = params.set('marketplace', marketplace);
    }
    return this.http.get<ProductItem>(`${this.API}/products/${id}`, { params });
  }

  getProducts(): Observable<ProductItem[]> {
    return this.http.get<ProductItem[]>(`${this.API}/products`);
  }

  getProductsByFilter(filters: {
    marketplace?: string
  }): Observable<Product[]> {

    const key = JSON.stringify(filters);
    const now = Date.now();
    const token = localStorage.getItem('kenji_token');
    const isLoggedIn = !!token;

    // ✅ só tenta cache no browser
    if (this.isBrowser && !isLoggedIn) {
      const cache = this.getCache();
      const cachedEntry = cache[key];

      if (cachedEntry && (now - cachedEntry.timestamp) < this.TTL) {
        return of(cachedEntry.data);
      }
    }

    const params = new HttpParams()
      .set('marketplace', filters.marketplace || '');

    return this.http.get<Product[]>(`${this.API}/products`, { params })
      .pipe(
        tap(data => {
          if (this.isBrowser) {
            const cache = this.getCache();
            cache[key] = {
              data,
              timestamp: now
            };
            localStorage.setItem(this.CACHE_KEY, JSON.stringify(cache));
          }
        })
      );
  }

  private getCache(): any {
    if (!this.isBrowser) return {};
    const cache = localStorage.getItem(this.CACHE_KEY);
    return cache ? JSON.parse(cache) : {};
  }

  clearProductsCache() {
    if (this.isBrowser) {
      localStorage.removeItem(this.CACHE_KEY);
    }
  }

  addProduct(formData: FormData): Observable<ProductItem> {
    return this.http.post<ProductItem>(`${this.API}/products`, formData);
  }

  updateProduct(id: string, product: Partial<ProductItem>) {
    this.productsSignal.update(products =>
      products.map(p => p.id === id ? { ...p, ...product } : p)
    );
  }

  updateProductFormData(id: string, formData: FormData) {
    return this.http.put<ProductItem>(`${this.API}/products/${id}`, formData);
  }

  deleteProduct(id: string) {
    this.productsSignal.update(products => products.filter(p => p.id !== id));
  }

  loadProducts() {
    this.getProducts().subscribe(products => {
      this.productsSignal.set(products);
    });
  }


}