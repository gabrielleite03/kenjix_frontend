import { Injectable, signal, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export interface Product {
  id: number;
  sku: string;
  name: string;
  description: string;
  category: string;
  price: number;
  oldPrice?: number;
  rating: number;
  reviews: number;
  images: string[];
  currentIndex: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private platformId = inject(PLATFORM_ID);
  private productsSignal = signal<Product[]>([]);
  products = this.productsSignal.asReadonly();

  async fetchProducts() {
    try {
      let baseUrl = '';
      if (isPlatformBrowser(this.platformId)) {
        baseUrl = window.location.origin;
      } else {
        // On server, always prefer localhost to avoid external proxy/auth issues
        // The platform hardcodes port 3000
        baseUrl = 'http://localhost:3000';
      }

      const url = `${baseUrl}/products.json`;
      const response = await fetch(url);
      
      const contentType = response.headers.get('content-type');
      if (!response.ok || !contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Fetch failed. Status:', response.status, 'Content-Type:', contentType, 'Body:', text.substring(0, 100));
        throw new Error(`Failed to fetch products: ${response.statusText} (Expected JSON, got ${contentType})`);
      }
      
      const data = await response.json();
      this.productsSignal.set(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  }
}
