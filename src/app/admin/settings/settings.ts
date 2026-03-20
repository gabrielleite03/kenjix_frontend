import {ChangeDetectionStrategy, Component, signal, inject, computed, Signal} from '@angular/core';
import {toSignal} from '@angular/core/rxjs-interop';
import {CommonModule} from '@angular/common';
import {MatIconModule} from '@angular/material/icon';
import {FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray} from '@angular/forms';
import {DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';
import {ProductService, ProductItem} from '../product/product.service';
import {startWith} from 'rxjs/operators';

interface StorageLocation {
  id: string;
  name: string;
  type: string;
}

interface ProductFormValue {
  name: string;
  sku: string;
  category: string;
  brand: string;
  description: string;
  sellingPrice: number;
  active: boolean;
  videoUrl: string;
  properties: { name: string; value: string }[];
}

interface Warehouse {
  id: string;
  name: string;
  location: string;
  capacity: number;
  storageLocations: StorageLocation[];
}

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, MatIconModule, FormsModule, ReactiveFormsModule],
  templateUrl: './settings.html',
  styleUrls: ['./settings.css', '../admin-shared.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Settings {
  activeTab = signal<'general' | 'notifications' | 'security' | 'categories' | 'warehouses' | 'products'>('general');
  
  private fb = inject(FormBuilder);
  private productService = inject(ProductService);
  private sanitizer = inject(DomSanitizer);
  
  generalForm: FormGroup;
  notificationForm: FormGroup;
  categoryForm: FormGroup;
  warehouseForm: FormGroup;
  storageLocationForm: FormGroup;
  productForm: FormGroup;
  currentPreviewImageIndex = signal(0);
  isProductFormCollapsed = signal(false);
  isProductPreviewCollapsed = signal(false);

  productFormValue!: Signal<ProductFormValue>;

  youtubeVideoId = computed(() => {
    const val = this.productFormValue();
    const url = val?.videoUrl;
    if (!url) return null;
    
    const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      return match[2];
    }
    return null;
  });

  youtubeThumbnail = computed(() => {
    const videoId = this.youtubeVideoId();
    if (!videoId) return null;
    return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
  });

  productPreview = computed(() => {
    const val = this.productFormValue();
    const images = this.productImages();
    const videoThumb = this.youtubeThumbnail();
    const videoId = this.youtubeVideoId();
    
    const media: ({ type: 'image'; url: string; videoId?: never } | { type: 'video'; url: string; videoId: string })[] = [
      ...images.map(url => ({ type: 'image' as const, url })),
      ...(videoThumb && videoId ? [{ type: 'video' as const, url: videoThumb, videoId }] : [])
    ];
    
    const activeIdx = this.currentPreviewImageIndex();
    const activeMedia = media.length > 0 ? media[activeIdx] || media[0] : null;
    
    return {
      name: val?.name || 'Nome do Produto',
      category: val?.category || 'Categoria',
      description: val?.description || 'Descrição do produto...',
      price: val?.sellingPrice || 0,
      brand: val?.brand || 'Marca',
      sku: val?.sku || 'SKU-000',
      media,
      activeMedia,
      videoUrl: val?.videoUrl,
      properties: val?.properties || []
    };
  });

  getSafeVideoUrl(videoId: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1`);
  }

  products = this.productService.products;
  editingProduct = signal<ProductItem | null>(null);
  productImages = signal<string[]>([]);

  categories = signal<{id: string, name: string, description: string, active: boolean}[]>([
    { id: '1', name: 'Alimentação', description: 'Rações, petiscos e suplementos', active: true },
    { id: '2', name: 'Higiene', description: 'Shampoos, tapetes higiênicos e escovas', active: true },
    { id: '3', name: 'Brinquedos', description: 'Bolas, pelúcias e mordedores', active: true },
    { id: '4', name: 'Acessórios', description: 'Coleiras, guias e caminhas', active: false },
  ]);

  editingCategory = signal<{id: string, name: string, description: string, active: boolean} | null>(null);

  warehouses = signal<Warehouse[]>([
    { 
      id: '1', 
      name: 'Depósito Central', 
      location: 'São Paulo, SP', 
      capacity: 5000,
      storageLocations: [
        { id: '1', name: 'Corredor A - Prateleira 1', type: 'Prateleira' },
        { id: '2', name: 'Corredor B - Freezer 1', type: 'Freezer' }
      ]
    },
    { 
      id: '2', 
      name: 'Filial Sul', 
      location: 'Curitiba, PR', 
      capacity: 2000, 
      storageLocations: [] 
    },
  ]);

  editingWarehouse = signal<Warehouse | null>(null);
  selectedWarehouseForLocations = signal<Warehouse | null>(null);
  editingStorageLocation = signal<StorageLocation | null>(null);

  constructor() {
    this.generalForm = this.fb.group({
      storeName: ['Kenji Pet Shop', [Validators.required]],
      email: ['contact@kenjipet.com', [Validators.required, Validators.email]],
      phone: ['(11) 98888-7777', [Validators.required]],
      address: ['Rua das Flores, 123 - São Paulo, SP', [Validators.required]],
      currency: ['BRL'],
      timezone: ['America/Sao_Paulo']
    });

    this.notificationForm = this.fb.group({
      lowStockAlert: [true],
      newOrderEmail: [true],
      weeklyReport: [false],
      customerSupport: [true]
    });

    this.categoryForm = this.fb.group({
      name: ['', [Validators.required]],
      description: ['', [Validators.maxLength(500)]],
      active: [true]
    });

    this.warehouseForm = this.fb.group({
      name: ['', [Validators.required]],
      location: ['', [Validators.required]],
      capacity: [0, [Validators.required, Validators.min(0)]]
    });

    this.storageLocationForm = this.fb.group({
      name: ['', [Validators.required]],
      type: ['Prateleira', [Validators.required]]
    });

    this.productForm = this.fb.group({
      name: ['', [Validators.required]],
      sku: ['', [Validators.required]],
      category: ['', [Validators.required]],
      brand: [''],
      description: [''],
      sellingPrice: [0, [Validators.required, Validators.min(0)]],
      active: [true],
      videoUrl: [''],
      properties: this.fb.array([])
    });

    this.productFormValue = toSignal(
      this.productForm.valueChanges.pipe(
        startWith(this.productForm.value)
      )
    );
  }

  saveGeneral() {
    if (this.generalForm.valid) {
      console.log('Saving general settings:', this.generalForm.value);
    }
  }

  saveNotifications() {
    console.log('Saving notification settings:', this.notificationForm.value);
  }

  addCategory() {
    if (this.categoryForm.valid) {
      const newCategory = {
        id: Math.random().toString(36).substring(2, 9),
        ...this.categoryForm.value
      };
      this.categories.update(cats => [...cats, newCategory]);
      this.categoryForm.reset({ active: true });
    }
  }

  editCategory(category: {id: string, name: string, description: string, active: boolean}) {
    this.editingCategory.set(category);
    this.categoryForm.patchValue({
      name: category.name,
      description: category.description,
      active: category.active
    });
  }

  saveCategory() {
    if (this.categoryForm.valid && this.editingCategory()) {
      const updatedCategory = {
        ...this.editingCategory()!,
        ...this.categoryForm.value
      };
      this.categories.update(cats => cats.map(c => c.id === updatedCategory.id ? updatedCategory : c));
      this.cancelEditCategory();
    }
  }

  cancelEditCategory() {
    this.editingCategory.set(null);
    this.categoryForm.reset({ active: true });
  }

  deleteCategory(id: string) {
    this.categories.update(cats => cats.filter(c => c.id !== id));
  }

  // Warehouse CRUD
  addWarehouse() {
    if (this.warehouseForm.valid) {
      const newWarehouse = {
        id: Math.random().toString(36).substring(2, 9),
        ...this.warehouseForm.value,
        storageLocations: []
      };
      this.warehouses.update(ws => [...ws, newWarehouse]);
      this.warehouseForm.reset({ capacity: 0 });
    }
  }

  editWarehouse(warehouse: Warehouse) {
    this.editingWarehouse.set(warehouse);
    this.warehouseForm.patchValue({
      name: warehouse.name,
      location: warehouse.location,
      capacity: warehouse.capacity
    });
  }

  saveWarehouse() {
    if (this.warehouseForm.valid && this.editingWarehouse()) {
      const updatedWarehouse = {
        ...this.editingWarehouse()!,
        ...this.warehouseForm.value
      };
      this.warehouses.update(ws => ws.map(w => w.id === updatedWarehouse.id ? updatedWarehouse : w));
      this.cancelEditWarehouse();
    }
  }

  cancelEditWarehouse() {
    this.editingWarehouse.set(null);
    this.warehouseForm.reset({ capacity: 0 });
  }

  deleteWarehouse(id: string) {
    this.warehouses.update(ws => ws.filter(w => w.id !== id));
    if (this.selectedWarehouseForLocations()?.id === id) {
      this.selectedWarehouseForLocations.set(null);
    }
  }

  // Storage Location Methods
  openManageLocations(warehouse: Warehouse) {
    this.selectedWarehouseForLocations.set(warehouse);
    this.cancelEditStorageLocation();
  }

  closeManageLocations() {
    this.selectedWarehouseForLocations.set(null);
  }

  addStorageLocation() {
    if (this.storageLocationForm.valid && this.selectedWarehouseForLocations()) {
      const newLocation = {
        id: Math.random().toString(36).substring(2, 9),
        ...this.storageLocationForm.value
      };
      
      this.warehouses.update(ws => ws.map(w => {
        if (w.id === this.selectedWarehouseForLocations()!.id) {
          const updatedLocations = [...w.storageLocations, newLocation];
          this.selectedWarehouseForLocations.update(sw => sw ? { ...sw, storageLocations: updatedLocations } : null);
          return { ...w, storageLocations: updatedLocations };
        }
        return w;
      }));
      
      this.storageLocationForm.reset({ type: 'Prateleira' });
    }
  }

  editStorageLocation(location: StorageLocation) {
    this.editingStorageLocation.set(location);
    this.storageLocationForm.patchValue({
      name: location.name,
      type: location.type
    });
  }

  saveStorageLocation() {
    if (this.storageLocationForm.valid && this.editingStorageLocation() && this.selectedWarehouseForLocations()) {
      const updatedLocation = {
        ...this.editingStorageLocation()!,
        ...this.storageLocationForm.value
      };

      this.warehouses.update(ws => ws.map(w => {
        if (w.id === this.selectedWarehouseForLocations()!.id) {
          const updatedLocations = w.storageLocations.map(loc => loc.id === updatedLocation.id ? updatedLocation : loc);
          this.selectedWarehouseForLocations.update(sw => sw ? { ...sw, storageLocations: updatedLocations } : null);
          return { ...w, storageLocations: updatedLocations };
        }
        return w;
      }));
      
      this.cancelEditStorageLocation();
    }
  }

  cancelEditStorageLocation() {
    this.editingStorageLocation.set(null);
    this.storageLocationForm.reset({ type: 'Prateleira' });
  }

  deleteStorageLocation(locationId: string) {
    if (this.selectedWarehouseForLocations()) {
      this.warehouses.update(ws => ws.map(w => {
        if (w.id === this.selectedWarehouseForLocations()!.id) {
          const updatedLocations = w.storageLocations.filter(loc => loc.id !== locationId);
          this.selectedWarehouseForLocations.update(sw => sw ? { ...sw, storageLocations: updatedLocations } : null);
          return { ...w, storageLocations: updatedLocations };
        }
        return w;
      }));
    }
  }

  // Product CRUD (Simplified for Settings)
  addProduct() {
    if (this.productForm.valid) {
      const formValue = this.productForm.value;
      this.productService.addProduct({
        ...formValue,
        weight: '',
        animalType: '',
        lifeStage: '',
        costPrice: 0,
        stock: 0, // Default to 0, will be managed via stock table
        minStock: 5,
        images: this.productImages(),
        active: formValue.active ?? true,
        videoUrl: formValue.videoUrl,
        properties: formValue.properties
      });
      this.productForm.reset({ sellingPrice: 0, active: true, videoUrl: '', description: '' });
      this.productProperties.clear();
      this.productImages.set([]);
    }
  }

  editProduct(product: ProductItem) {
    this.isProductFormCollapsed.set(false);
    this.editingProduct.set(product);
    this.productImages.set(product.images);
    this.productForm.patchValue({
      name: product.name,
      sku: product.sku,
      category: product.category,
      brand: product.brand,
      description: product.description || '',
      sellingPrice: product.sellingPrice,
      active: product.active,
      videoUrl: product.videoUrl || ''
    });

    this.productProperties.clear();
    if (product.properties) {
      product.properties.forEach(prop => {
        this.productProperties.push(this.fb.group({
          name: [prop.name, Validators.required],
          value: [prop.value, Validators.required]
        }));
      });
    }
  }

  saveProduct() {
    if (this.productForm.valid && this.editingProduct()) {
      const formValue = this.productForm.value;
      this.productService.updateProduct(this.editingProduct()!.id, {
        ...formValue,
        images: this.productImages(),
        videoUrl: formValue.videoUrl,
        properties: formValue.properties
      });
      this.cancelEditProduct();
    }
  }

  cancelEditProduct() {
    this.editingProduct.set(null);
    this.productImages.set([]);
    this.productForm.reset({ sellingPrice: 0, active: true, videoUrl: '', description: '' });
    this.productProperties.clear();
  }

  deleteProduct(id: string) {
    this.productService.deleteProduct(id);
  }

  // Product Properties Methods
  get productProperties() {
    return this.productForm.get('properties') as FormArray;
  }

  addProductProperty() {
    const propertyForm = this.fb.group({
      name: ['', Validators.required],
      value: ['', Validators.required]
    });
    this.productProperties.push(propertyForm);
  }

  removeProductProperty(index: number) {
    this.productProperties.removeAt(index);
  }

  // Product Image Methods
  onProductFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const files = input.files;
    if (files) {
      const currentCount = this.productImages().length;
      const remainingSlots = 4 - currentCount;
      
      if (remainingSlots <= 0) {
        alert('Você já atingiu o limite máximo de 4 imagens.');
        return;
      }

      Array.from(files).slice(0, remainingSlots).forEach(file => {
        const reader = new FileReader();
        reader.onload = (e: ProgressEvent<FileReader>) => {
          if (e.target?.result) {
            this.productImages.update(prev => [...prev, e.target!.result as string]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  }

  removeProductImage(index: number) {
    this.productImages.update(prev => prev.filter((_, i) => i !== index));
  }
}
