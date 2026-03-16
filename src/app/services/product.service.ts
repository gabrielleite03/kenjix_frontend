import { Injectable, signal } from '@angular/core';

export interface Product {
  id: number;
  sku: string;
  name: string;
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
  private productsSignal = signal<Product[]>([]);
  products = this.productsSignal.asReadonly();

  async fetchProducts() {
    try {
      const response = await fetch('/products.json');
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      const data = await response.json();
      this.productsSignal.set(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  }
}
