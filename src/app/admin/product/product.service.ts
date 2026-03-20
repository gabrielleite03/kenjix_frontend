import {Injectable, signal} from '@angular/core';

export interface ProductProperty {
  name: string;
  value: string;
}

export interface ProductItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  brand: string;
  weight: string;
  animalType: string;
  lifeStage: string;
  description: string;
  sellingPrice: number;
  costPrice: number;
  stock: number;
  minStock: number;
  images: string[];
  active: boolean;
  createdAt: Date;
  videoUrl?: string;
  properties?: ProductProperty[];
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private productsSignal = signal<ProductItem[]>([
    {
      id: '1',
      name: 'Ração Premium Adulto Frango',
      sku: 'KP-00001',
      category: 'Food',
      brand: 'Royal Canin',
      weight: '15kg',
      animalType: 'Dog',
      lifeStage: 'Adult',
      description: 'Ração de alta qualidade para cães adultos.',
      sellingPrice: 189.90,
      costPrice: 120.00,
      stock: 25,
      minStock: 5,
      images: ['https://picsum.photos/seed/dogfood/400/400'],
      active: true,
      createdAt: new Date(),
      properties: [
        { name: 'Sabor', value: 'Frango' },
        { name: 'Proteína', value: '25%' }
      ]
    },
    {
      id: '2',
      name: 'Arranhador para Gatos Torre',
      sku: 'KP-00002',
      category: 'Accessories',
      brand: 'Petz',
      weight: '2kg',
      animalType: 'Cat',
      lifeStage: 'All',
      description: 'Arranhador resistente com 3 níveis.',
      sellingPrice: 129.00,
      costPrice: 65.00,
      stock: 8,
      minStock: 3,
      images: ['https://picsum.photos/seed/catscratch/400/400'],
      active: true,
      createdAt: new Date()
    },
    {
      id: '3',
      name: 'Shampoo Antipulgas 500ml',
      sku: 'KP-00003',
      category: 'Hygiene',
      brand: 'Sanol',
      weight: '500ml',
      animalType: 'Dog',
      lifeStage: 'All',
      description: 'Shampoo eficaz contra pulgas e carrapatos.',
      sellingPrice: 35.50,
      costPrice: 18.00,
      stock: 45,
      minStock: 10,
      images: ['https://picsum.photos/seed/shampoo/400/400'],
      active: false,
      createdAt: new Date()
    }
  ]);

  products = this.productsSignal.asReadonly();

  getProductById(id: string) {
    return this.productsSignal().find(p => p.id === id);
  }

  addProduct(product: Omit<ProductItem, 'id' | 'createdAt'>) {
    const newProduct: ProductItem = {
      ...product,
      id: Math.random().toString(36).substring(2, 9),
      createdAt: new Date()
    };
    this.productsSignal.update(products => [...products, newProduct]);
  }

  updateProduct(id: string, product: Partial<ProductItem>) {
    this.productsSignal.update(products => 
      products.map(p => p.id === id ? { ...p, ...product } : p)
    );
  }

  deleteProduct(id: string) {
    this.productsSignal.update(products => products.filter(p => p.id !== id));
  }
}
