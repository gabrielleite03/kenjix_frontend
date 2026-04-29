import { ChangeDetectionStrategy, Component, signal, inject, computed, Signal, OnInit, effect } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ProductService, ProductItem } from '../product/product.service';
import { startWith } from 'rxjs/operators';
import { CategoryService, Category } from '../../services/category.service';
import { WarehouseService, Warehouse, StorageLocation, StorageLocationType } from '../../services/warehouse.service';
import { NotificationService } from '../../shared/services/notification';
import { ExpenseService, ExpenseItem, ExpenseAttachment, ExpenseCategory } from '../../services/expenses.service';
import { CostCenter, CostCenterProperty, CostCenterService } from '../../services/cost-center.service';



export interface ProductFormValue {
  name: string;
  sku: string;
  category: string;
  brand: string;
  ean?: string | null;
  ncm?: string | null;
  description: string;
  sellingPrice: number;
  volume?: number;
  active: boolean;
  videoUrl: string;
  properties: { name: string; value: string }[];
}


@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, MatIconModule, FormsModule, ReactiveFormsModule],
  templateUrl: './settings.html',
  styleUrls: ['./settings.css', '../admin-shared.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Settings implements OnInit {
  private fb = inject(FormBuilder);
  private productService = inject(ProductService);
  private notificationService = inject(NotificationService);
  private sanitizer = inject(DomSanitizer);
  private CategoryService = inject(CategoryService);
  private WarehouseService = inject(WarehouseService);
  private expenseService = inject(ExpenseService);
  private costCenterService = inject(CostCenterService);
  categories = signal<Category[]>([]);
  warehouses = signal<Warehouse[]>([]);
  storageLocationTypes = signal<StorageLocationType[]>([]);
  expenseCategories = signal<ExpenseCategory[]>([]);




  ngOnInit() {
    this.loadCategories();
    this.loadWarehouses();
    this.loadStageLocationTypes();
    this.loadProducts();
    this.loadExpenses();
    this.loadEspensesCategories();
    this.loadCostCenters();
  }

  loadCategories() {
    this.CategoryService.findAll()
      .subscribe({
        next: (data) => {
          this.categories.set(data);
        },
        error: (err) => {
          console.error('Erro ao carregar categorias', err);
        }
      });
  }

  loadStageLocationTypes() {
    this.WarehouseService.getAllStorageLocationTypes()
      .subscribe({
        next: (data) => {
          this.storageLocationTypes.set(data);
        },
        error: (err) => {
          console.error('Erro ao carregar tipos de local de armazenamento', err);
        }
      });
  }

  loadProducts() {
    this.productService.getProducts().subscribe(products => {
      const mapped = products.map(p => ({
        ...p,
        images: p.images?.map((img: any) => img.url) ?? []
      }));

      this.products.set(mapped);
    });
  }

  loadExpenses() {
    this.expenseService.findAll()
      .subscribe(data => this.expenses.set(data));
  }

  loadEspensesCategories() {
    this.expenseService.findAllExpensesCategories()
      .subscribe({
        next: (data) => {
          this.expenseCategories.set(data);
        },
        error: (err) => {
          console.error('Erro ao carregar categorias de despesas', err);
        }
      });
  }

  loadCostCenters() {
    this.costCenterService.findAll()
      .subscribe({
        next: (data) => {
          this.costCenters.set(data);
        },
        error: (err) => {
          console.error('Erro ao carregar centros de custo', err);
        }
      });
  }



  activeTab = signal<'general' | 'notifications' | 'security' | 'categories' | 'warehouses' | 'products' | 'expenses' | 'cost-centers'>('general');

  generalForm: FormGroup;
  notificationForm: FormGroup;
  categoryForm: FormGroup;
  warehouseForm: FormGroup;
  storageLocationForm: FormGroup;
  productForm: FormGroup;
  expenseForm: FormGroup;
  currentPreviewImageIndex = signal(0);
  isProductFormCollapsed = signal(true);
  isProductPreviewCollapsed = signal(true);
  isCategoryFormCollapsed = signal(true);
  isExpenseFormCollapsed = signal(true);
  isCostCenterFormCollapsed = signal(true);

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
    const existingImages = this.existingImages();
    this.deletedImages = signal<string[]>([]);
    const newImages = this.newImages();
    const videoThumb = this.youtubeThumbnail();
    const videoId = this.youtubeVideoId();

    const media: (
      { type: 'image'; url: string; videoId?: never } |
      { type: 'video'; url: string; videoId: string }
    )[] = [
        // imagens existentes (URL)
        ...existingImages.map(url => ({
          type: 'image' as const,
          url
        })),

        // novas imagens (File)
        ...newImages.map(file => ({
          type: 'image' as const,
          url: URL.createObjectURL(file)
        })),

        // vídeo
        ...(videoThumb && videoId
          ? [{ type: 'video' as const, url: videoThumb, videoId }]
          : [])
      ];

    const activeIdx = this.currentPreviewImageIndex();
    const activeMedia = media.length > 0 ? media[activeIdx] || media[0] : null;

    return {
      name: val?.name || 'Nome do Produto',
      category: this.categories()
        .find(c => Number(c.id) === Number(val?.category))?.name || 'Categoria',
      description: val?.description || 'Descrição do produto...',
      brand: val?.brand || 'Marca',
      sku: val?.sku || 'SKU-000',
      ean: val?.ean,
      ncm: val?.ncm,
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
  productImages = signal<File[]>([]);
  existingImages = signal<string[]>([]);
  deletedImages = signal<string[]>([]);
  newImages = signal<File[]>([]);
  expenseFiles = signal<File[]>([]);

  // Categories Search and Pagination
  categorySearch = signal('');
  categoryPage = signal(1);
  categoryItemsPerPage = signal(5);
  categoryItemsPerPageOptions = [5, 10, 20, 50];

  filteredCategories = computed(() => {
    const search = this.categorySearch().toLowerCase();
    const allCategories = this.categories();

    if (!search) return allCategories;

    return allCategories.filter(cat =>
      cat.name.toLowerCase().includes(search) ||
      cat.description.toLowerCase().includes(search)
    );
  });

  totalCategoryPages = computed(() => {
    return Math.ceil(this.filteredCategories().length / this.categoryItemsPerPage());
  });

  paginatedCategories = computed(() => {
    const page = this.categoryPage();
    const perPage = this.categoryItemsPerPage();
    const start = (page - 1) * perPage;
    return this.filteredCategories().slice(start, start + perPage);
  });



  setCategoryPage(page: number) {
    const total = this.totalCategoryPages();
    if (page >= 1 && page <= total) {
      this.categoryPage.set(page);
    } else if (page > total) {
      this.categoryPage.set(total || 1);
    } else if (page < 1) {
      this.categoryPage.set(1);
    }
  }

  setCategoryItemsPerPage(size: number) {
    this.categoryItemsPerPage.set(size);
    this.categoryPage.set(1);
  }


  onCategorySearch(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.categoryPage.set(1);
    this.categorySearch.set(value);
  }

  // Expenses Search and Pagination
  expenseSearch = signal('');
  expenseCategoryFilter = signal('');
  expensePage = signal(1);
  expenseItemsPerPage = signal(10);
  expenseItemsPerPageOptions = [5, 10, 20, 50];

  expenses = signal<ExpenseItem[]>([]);



  filteredExpenses = computed(() => {
    const search = this.expenseSearch()?.toLowerCase() ?? '';
    const category = Number(this.expenseCategoryFilter()); // 👈 converte
    const allExpenses = this.expenses() ?? [];

    return allExpenses.filter(e => {
      const matchesSearch =
        !search || e.description?.toLowerCase().includes(search);

      const matchesCategory =
        !category || e.category?.id === category;

      return matchesSearch && matchesCategory;
    });
  });

  totalExpensePages = computed(() => {
    return Math.ceil(this.filteredExpenses().length / this.expenseItemsPerPage());
  });

  paginatedExpenses = computed(() => {

    const page = this.expensePage();
    const perPage = this.expenseItemsPerPage();
    const start = (page - 1) * perPage;
    return this.filteredExpenses().slice(start, start + perPage);
  });

  setExpensePage(page: number) {
    if (page >= 1 && page <= this.totalExpensePages()) {
      this.expensePage.set(page);
    }
  }

  setExpenseItemsPerPage(size: number) {
    this.expenseItemsPerPage.set(size);
    this.expensePage.set(1);
  }

  editingExpense = signal<ExpenseItem | null>(null);
  viewingExpenseAttachments = signal<ExpenseItem | null>(null);

  costCenters = signal<CostCenter[]>([]);

  editingCostCenter = signal<CostCenter | null>(null);
  costCenterSearch = signal('');
  costCenterPage = signal(1);
  costCenterItemsPerPage = signal(5);

  filteredCostCenters = computed(() => {
    const search = this.costCenterSearch().toLowerCase();
    const all = this.costCenters();
    if (!search) return all;
    return all.filter(cc =>
      cc.name.toLowerCase().includes(search) ||
      cc.code.toLowerCase().includes(search) ||
      cc.description.toLowerCase().includes(search)
    );
  });

  totalCostCenterPages = computed(() => {
    return Math.ceil(this.filteredCostCenters().length / this.costCenterItemsPerPage());
  });

  paginatedCostCenters = computed(() => {
    const page = this.costCenterPage();
    const perPage = this.costCenterItemsPerPage();
    const start = (page - 1) * perPage;
    return this.filteredCostCenters().slice(start, start + perPage);
  });

  setCostCenterPage(page: number) {
    const total = this.totalCostCenterPages();
    if (page >= 1 && page <= total) {
      this.costCenterPage.set(page);
    }
  }

  onCostCenterSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    this.costCenterSearch.set(input.value);
    this.costCenterPage.set(1);
  }




  editingCategory = signal<{ id: string, name: string, description: string, active: boolean } | null>(null);

  /// searching products
  // Products Search, Category Filter and Pagination
  productSearch = signal('');
  productCategoryFilter = signal('');
  productPage = signal(1);
  productItemsPerPage = signal(5);
  productItemsPerPageOptions = [5, 10, 20, 50];

  filteredProducts = computed(() => {
    const search = this.productSearch().toLowerCase();
    const categoryFilter = this.productCategoryFilter();

    return this.products().filter(p => {
      const matchesSearch =
        !search ||
        p.name.toLowerCase().includes(search) ||
        p.sku.toLowerCase().includes(search);

      const matchesCategory =
        !categoryFilter ||
        String(p.category?.id) === categoryFilter;

      return matchesSearch && matchesCategory;
    });
  });

  totalProductPages = computed(() => {
    return Math.ceil(this.filteredProducts().length / this.productItemsPerPage());
  });

  paginatedProducts = computed(() => {
    const page = this.productPage();
    const perPage = this.productItemsPerPage();
    const start = (page - 1) * perPage;
    return this.filteredProducts().slice(start, start + perPage);
  });

  setProductPage(page: number) {
    const total = this.totalProductPages();
    if (page >= 1 && page <= total) {
      this.productPage.set(page);
    }
  }

  setProductItemsPerPage(size: number) {
    this.productItemsPerPage.set(size);
    this.productPage.set(1);
  }

  onProductSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    this.productSearch.set(input.value);
    this.productPage.set(1);
  }

  onProductCategoryFilter(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.productCategoryFilter.set(select.value);
    this.productPage.set(1);
  }

  getCategoryNameById(id: any): string {
    return this.categories().find(c => c.id === id.id)?.name ?? 'koto';
  }




  // end searching products

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
      type: [null, [Validators.required]], // number
      capacity: [0, [Validators.required, Validators.min(0)]]
    });

    this.productForm = this.fb.group({
      name: ['', [Validators.required]],
      sku: ['', [Validators.required]],
      category: ['', [Validators.required]],
      brand: [''],
      ean: [''],
      ncm: [''],
      description: [''],
      active: [true],
      videoUrl: [''],
      properties: this.fb.array([]),
      volume: ['']
    });

    this.productFormValue = toSignal(
      this.productForm.valueChanges.pipe(
        startWith(this.productForm.value)
      )
    );

    this.expenseForm = this.fb.group({
      description: ['', [Validators.required]],
      category: ['Outros', [Validators.required]],
      amount: [0, [Validators.required, Validators.min(0.01)]],
      date: [new Date().toISOString().split('T')[0], [Validators.required]],
      status: ['pending', [Validators.required]],
      attachments: [[]]
    });

    // Auto-generate SKU based on category and name
    effect(() => {
      const val = this.productFormValue();
      const category = val?.category;
      const name = val?.name;
      const isEditing = !!this.editingProduct();

      if (!isEditing && category && name && name.trim().length > 0) {
        this.generateSku(category, name);
      }
    });


  }

  private generateSku(categoryID: string, name: String) {

    // busca categoria pelo id
    const category = this.categories().find(c => String(c.id) === categoryID);

    if (!category) return;
    // Remove espaços e pega apenas letras válidas
    const cleanCategory = category.name
      .trim()
      .toUpperCase()
      .replace(/[^A-ZÀ-ÿ\s]/g, ''); // remove números/símbolos

    const cleanName = name
      .trim()
      .toUpperCase()
      .replace(/[^A-ZÀ-ÿ\s]/g, ''); // remove números/símbolos

    // pega as palavras da categoria
    const words = cleanCategory
      .split(/\s+/)
      .filter(w => w.length > 0 && !['E', 'DE', 'DO', 'DA', 'O', 'A'].includes(w));

    // pega as palavras do nome
    const wordsName = cleanName
      .split(/\s+/)
      .filter(w => w.length > 0 && !['E', 'DE', 'DO', 'DA', 'O', 'A'].includes(w));

    let initials = '';

    if (words.length >= 2) {
      // duas primeiras palavras
      initials = (words[0][0] + words[1][0]).toUpperCase();
    } else if (words.length === 1) {
      // pega duas primeiras letras da palavra
      initials = words[0].substring(0, 2).toUpperCase();
    } else {
      initials = 'XX';
    }

    if (wordsName.length >= 2) {
      // duas primeiras palavras
      initials = initials + (wordsName[0][0] + wordsName[1][0]).toUpperCase();
    } else if (wordsName.length === 1) {
      // pega duas primeiras letras da palavra
      initials = initials + wordsName[0].substring(0, 2).toUpperCase();
    } else {
      initials = initials + 'XX';
    }

    // Count products in this category to get sequential ID
    const productsInCategory = this.productService.products()
      .filter(p => String(p.category?.id) === categoryID);

    const nextId = productsInCategory.length + 1;
    const sequentialId = nextId.toString().padStart(5, '0');

    const newSku = `${initials}-${sequentialId}`;

    const currentSku = this.productForm.get('sku')?.value;

    if (!currentSku || /^[A-Z]{2}-\d{5}$/.test(currentSku) || currentSku.length < 3) {
      if (currentSku !== newSku) {
        this.productForm.patchValue({ sku: newSku }, { emitEvent: false });
      }
    }
  }




  costCenterForm = this.fb.group({
    name: ['', [Validators.required]],
    code: ['', [Validators.required]],
    description: [''],
    active: [true],
    properties: this.fb.array([])
  });

  get costCenterProperties() {
    return this.costCenterForm.get('properties') as FormArray;
  }

  addCostCenterProperty() {
    this.costCenterProperties.push(this.fb.group({
      name: ['', Validators.required],
      value: ['', Validators.required],
      type: ['value', Validators.required]
    }));
  }

  removeCostCenterProperty(index: number) {
    this.costCenterProperties.removeAt(index);
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

      const category = {
        name: this.categoryForm.value.name,
        description: this.categoryForm.value.description,
        active: this.categoryForm.value.active
      };
      this.CategoryService.save(category)
        .subscribe({
          next: (saved) => {
            this.categories.update(cats => [...cats, saved]);
            this.categoryForm.reset({ active: true });
            this.notificationService.success('Categoria adicionada com sucesso!');
          },
          error: (err) => console.error(err)
        });
    }
  }

  editCategory(category: { id: string, name: string, description: string, active: boolean }) {
    this.isCategoryFormCollapsed.set(false);
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

      this.CategoryService.update(updatedCategory)
        .subscribe({
          next: (saved) => {

            this.categories.update(cats =>
              cats.map(c => c.id === saved.id ? saved : c)
            );
            this.notificationService.success('Categoria atualizada com sucesso!');
            this.cancelEditCategory();
          },
          error: (err) => {
            console.error('Erro ao atualizar categoria', err);
            alert('Erro ao atualizar categoria');
          }
        });
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
        ...this.warehouseForm.value,
        active: true
      };

      this.WarehouseService.create(newWarehouse).subscribe({
        next: (created) => {
          this.warehouses.update(ws => [...ws, created]);
          this.warehouseForm.reset({ capacity: 0 });
          this.notificationService.info('Depósito adicionado com sucesso.');
        },
        error: (err) => {
          this.notificationService.error('Erro ao criar warehouse');
          console.error('Erro ao criar warehouse', err);
        }
      });
    }
  }

  loadWarehouses() {
    this.WarehouseService.getAll()
      .subscribe({
        next: (data) => {

          const mapped = data.map(w => ({
            id: String(w.id),
            name: w.name,
            location: w.location,
            capacity: w.capacity ?? 0,
            storageLocations: []
          }));

          this.warehouses.set(mapped);

          // carregar locations depois
          mapped.forEach(w => this.loadStorageLocations(w.id));
        },
        error: (err) => {
          this.notificationService.error('Erro ao carregar warehouses');
          console.error('Erro ao carregar warehouses', err);
        }
      });
  }

  loadStorageLocations(warehouseId: string) {
    this.WarehouseService.getStorageLocations(warehouseId)
      .subscribe({
        next: (locations: any[] | null) => {

          const mappedLocations = (locations ?? []).map(l => ({
            id: String(l.id),
            warehouseId: warehouseId,
            name: l.name,
            type: this.storageLocationTypes()
              .find(t => t.id === Number(l.warehouse_place_type_id))?.name
              || l.warehouse_place_type_id,
            capacity: l.capacity,
            active: l.active
          }));

          this.warehouses.update(ws =>
            ws.map(w =>
              w.id === warehouseId
                ? { ...w, storageLocations: mappedLocations }
                : w
            )
          );

          this.selectedWarehouseForLocations.update(sw =>
            sw && sw.id === warehouseId
              ? { ...sw, storageLocations: mappedLocations }
              : sw
          );
        },
        error: (err) => {
          this.notificationService.error('Erro ao carregar locations do warehouse');
          console.error(`Erro ao carregar locations do warehouse ${warehouseId}`, err);
        }
      });
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
    if (this.warehouseForm.invalid || !this.editingWarehouse()) return;

    const updatedWarehouse = {
      ...this.editingWarehouse()!,
      ...this.warehouseForm.value,
      id: Number(this.editingWarehouse()?.id)
    };

    this.WarehouseService.updateWarehouse(updatedWarehouse).subscribe({
      next: () => {
        this.loadWarehouses();
        this.cancelEditWarehouse();
      },
      error: () => {
        this.notificationService.error('Erro ao atualizar warehouse');
      }
    });
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

      this.WarehouseService.createStorageLocation(
        this.selectedWarehouseForLocations()!.id,
        this.storageLocationForm.value
      )
        .subscribe({
          next: (created) => {

            this.warehouses.update(ws => ws.map(w => {
              if (w.id === this.selectedWarehouseForLocations()!.id) {

                const updatedLocations = [
                  ...(w.storageLocations || []),
                  created
                ];

                this.selectedWarehouseForLocations.update(sw =>
                  sw ? { ...sw, storageLocations: updatedLocations } : null
                );

                return { ...w, storageLocations: updatedLocations };
              }
              return w;
            }));
            this.notificationService.success('Storage location criada com sucesso!');
            this.storageLocationForm.reset({ type: 'Prateleira' });
          },
          error: (err) => {
            this.notificationService.error('Erro ao criar storage location');
            console.error('Erro ao salvar storage location', err);
          }
        });
    }
  }


  editStorageLocation(location: StorageLocation) {
    this.editingStorageLocation.set(location);

    const typeId = this.storageLocationTypes()
      .find(t => t.name === location.type)?.id;

    this.storageLocationForm.patchValue({
      name: location.name,
      type: typeId,
      capacity: location.capacity
    });
  }

  saveStorageLocation() {
    if (
      this.storageLocationForm.valid &&
      this.editingStorageLocation() &&
      this.selectedWarehouseForLocations()
    ) {

      const updatedLocation = {
        ...this.editingStorageLocation()!,
        ...this.storageLocationForm.value // <-- já é number
      };

      this.WarehouseService.updateStorageLocation(
        this.selectedWarehouseForLocations()!.id,
        this.editingStorageLocation()!.id,
        updatedLocation
      ).subscribe({
        next: () => {
          this.loadStorageLocations(this.selectedWarehouseForLocations()!.id);
          this.cancelEditStorageLocation();
        },
        error: (err) => {
          console.error('Erro ao atualizar storage location', err);
        }
      });
    }
  }

  cancelEditStorageLocation() {
    this.editingStorageLocation.set(null);
    this.storageLocationForm.reset({
      type: 'Prateleira',
      active: true,
      capacity: 0
    });
  }


  deleteStorageLocation(locationId: string) {
    const warehouse = this.selectedWarehouseForLocations();
    if (!warehouse) return;

    this.WarehouseService.deleteStorageLocation(warehouse.id, locationId)
      .subscribe({
        next: () => {
          //this.loadStorageLocations(warehouse.id);
          this.loadWarehouses();
          this.warehouses.update(ws => ws.map(w => {
            if (w.id === this.selectedWarehouseForLocations()!.id) {
              const updatedLocations = w.storageLocations.filter(loc => loc.id !== locationId);
              this.selectedWarehouseForLocations.update(sw => sw ? { ...sw, storageLocations: updatedLocations } : null);
              return { ...w, storageLocations: updatedLocations };
            }
            return w;
          }));
          this.notificationService.warning('Storage location deletada com sucesso!');
        },
        error: (err) => {
          this.notificationService.error('Erro ao deletar storage location');
          console.error('Erro ao deletar storage location', err);
        }
      });
  }


  addProduct() {
    if (this.productForm.valid) {
      const formValue = this.productForm.value;

      const formData = new FormData();

      formData.append('name', formValue.name);
      formData.append('sku', formValue.sku);
      formData.append('category', formValue.category);
      formData.append('brand', formValue.brand);
      formData.append('description', formValue.description);
      formData.append('active', String(formValue.active ?? true));
      formData.append('videoUrl', formValue.videoUrl ?? '');

      formData.append('weight', '');
      formData.append('animalType', '');
      formData.append('lifeStage', '');
      formData.append('costPrice', '0');
      formData.append('stock', '0');
      formData.append('minStock', '5');
      formData.append('volume', formValue.volume ?? '');
      formData.append('ean', formValue.ean ?? '');
      formData.append('ncm', formValue.ncm ?? '');


      // propriedades (JSON string)
      formData.append('properties', JSON.stringify(formValue.properties));

      // imagens
      this.productImages().forEach(file => {
        formData.append('images', file);
      });

      this.productService.addProduct(formData).subscribe({
        next: (createdProduct: ProductItem) => {
          this.productForm.reset();
          this.productProperties.clear();
          this.productImages.set([]);
        }
      });
    }
  }

  async editProduct(product: ProductItem) {
    this.isProductFormCollapsed.set(false);
    this.editingProduct.set(product);

    // IMPORTANTÍSSIMO 👇
    this.existingImages.set(product.images ?? []);

    this.newImages.set([]);

    this.productForm.patchValue({
      name: product.name,
      sku: product.sku,
      category: product.category?.id,
      brand: product.brand,
      description: product.description || '',
      active: product.active,
      videoUrl: product.videos?.[0]?.url || '',
      volume: product.volume || '',
      ean: product.ean || '',
      ncm: product.ncm || '',
    });

    this.productProperties.clear();
    (product.properties ?? []).forEach(prop => {
      this.productProperties.push(
        this.fb.group({
          name: [prop.name],
          value: [prop.value]
        })
      );
    });

  }


  saveProduct() {
    if (this.productForm.invalid || !this.editingProduct()) return;

    const formValue = this.productForm.value;

    const formData = new FormData();

    // -------------------------
    // CAMPOS
    // -------------------------
    formData.append('name', formValue.name);
    formData.append('sku', formValue.sku);
    formData.append('category', formValue.category);
    formData.append('brand', formValue.brand);
    formData.append('description', formValue.description || '');
    formData.append('active', String(formValue.active ?? true));
    formData.append('videoUrl', formValue.videoUrl ?? '');

    formData.append('weight', '');
    formData.append('animalType', '');
    formData.append('lifeStage', '');
    formData.append('costPrice', '0');
    formData.append('stock', '0');
    formData.append('minStock', '5');
    formData.append('volume', formValue.volume ?? '');
    formData.append('ean', formValue.ean ?? '');
    formData.append('ncm', formValue.ncm ?? '');

    // -------------------------
    // PROPRIEDADES
    // -------------------------
    formData.append(
      'properties',
      JSON.stringify(formValue.properties ?? [])
    );

    // -------------------------
    // EXISTING IMAGES (S3 URLs)
    // ⚠️ NÃO converter pra File
    // -------------------------
    formData.append(
      'existingImages',
      JSON.stringify(this.existingImages())
    );

    formData.append(
      'deletedImages',
      JSON.stringify(this.deletedImages())
    );

    this.newImages().forEach(file => {
      formData.append('new_images', file);
    });

    // -------------------------
    // NOVAS IMAGENS (FILES)
    // -------------------------
    this.productImages().forEach(file => {
      formData.append('images', file);
    });

    // -------------------------
    // REQUEST
    // -------------------------
    this.productService
      .updateProductFormData(this.editingProduct()!.id, formData)
      .subscribe({
        next: () => {
          this.notificationService.success('Produto atualizado com sucesso! 🎉');

          this.cancelEditProduct();
          this.loadProducts();

          this.productImages.set([]);
          this.existingImages.set([]);
          this.editingProduct.set(null);
        },
        error: (err) => {
          this.notificationService.error('Erro ao atualizar produto');
          console.error(err);
        }
      });
  }

  async urlToFile(url: string, index: number): Promise<File> {
    const response = await fetch(url);
    const blob = await response.blob();

    return new File([blob], `existing-${index}.jpg`, {
      type: blob.type
    });
  }



  cancelEditProduct() {
    this.editingProduct.set(null);

    this.productImages.set([]);
    this.existingImages.set([]);
    this.newImages.set([]);

    this.productProperties.clear();

    this.productForm.reset({
      active: true
    });
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

    if (!files) return;

    const currentCount =
      this.productImages().length +
      this.existingImages().length;

    const remainingSlots = 4 - currentCount;

    if (remainingSlots <= 0) {
      alert('Você já atingiu o limite máximo de 4 imagens.');
      input.value = '';
      return;
    }

    const newFiles = Array.from(files).slice(0, remainingSlots);

    this.productImages.update(prev => [
      ...prev,
      ...newFiles
    ]);

    input.value = '';
  }

  private previewMap = new Map<File, string>();

  createPreview(file: File | string): string {
    if (typeof file === 'string') {
      return file;
    }

    if (!this.previewMap.has(file)) {
      this.previewMap.set(file, URL.createObjectURL(file));
    }

    return this.previewMap.get(file)!;
  }

  removeExistingImage(index: number) {
    const img = this.existingImages()[index];

    this.existingImages.update(list =>
      list.filter((_, i) => i !== index)
    );

    this.deletedImages.update(list => [
      ...list,
      img
    ]);
  }

  removeNewImage(index: number) {
    this.productImages.update(files =>
      files.filter((_, i) => i !== index)
    );
  }

  getProductImageUrl(image: File | string): string {
    if (typeof image === 'string') {
      return image; // já é URL existente
    }

    return URL.createObjectURL(image); // novo arquivo
  }

  removeProductImage(index: number) {
    this.productImages.update(prev => prev.filter((_, i) => i !== index));
  }

  onImagesSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;

    const files = Array.from(input.files);

    this.newImages.update(current => [...current, ...files]);
  }




  // Expense CRUD
  existingFiles: any[] = []; // arquivos vindos do backend
  newFiles: File[] = [];     // arquivos adicionados pelo usuário
  imagePreviews: { file: File, url: string }[] = [];

  onExpenseFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;

    const files = Array.from(input.files);
    this.newFiles.push(...files);

    // cria previews temporários para os arquivos novos
    this.imagePreviews.push(...files.map(f => ({ file: f, url: URL.createObjectURL(f) })));

    // atualiza o FormControl com todos arquivos (existentes + novos)
    this.expenseForm.patchValue({
      attachments: [...this.existingFiles, ...this.imagePreviews]
    });
  }

  removeExpenseAttachment(index: number) {
    const current = this.expenseForm.get('attachments')?.value as ExpenseAttachment[] || [];
    const updated = current.filter((_, i) => i !== index);
    this.expenseForm.patchValue({ attachments: updated });
  }

  addExpense() {
    if (this.expenseForm.valid) {
      const formValue = this.expenseForm.value;
      const formData = new FormData();

      formData.append('description', formValue.description);
      formData.append('status', formValue.status);

      // Força enviar apenas o ID da categoria
      const categoryId = typeof formValue.category === 'object'
        ? formValue.category.id
        : formValue.category;
      formData.append('category_id', String(categoryId));

      formData.append('amount', String(formValue.amount));
      formData.append('date', formValue.date);

      // adiciona os arquivos selecionados
      if (this.newFiles?.length) {
        this.newFiles.forEach(file => formData.append('files', file));
      }

      this.expenseService.addExpense(formData).subscribe({
        next: (savedExpense) => {
          this.loadExpenses();

          // limpa arquivos selecionados
          this.newFiles = [];

          this.expenseForm.reset({
            category: 'Outros',
            amount: 0,
            date: new Date().toISOString().split('T')[0],
            status: 'pending',
            attachments: []
          });

          this.isExpenseFormCollapsed.set(true);
          this.notificationService.success('Despesa adicionada com sucesso!');
        },
        error: () => {
          this.notificationService.error('Erro ao adicionar despesa');
        }
      });
    }
  }

  editExpense(expense: ExpenseItem) {
    this.isExpenseFormCollapsed.set(false);
    this.editingExpense.set(expense);

    const formattedDate = expense.date
      ? new Date(expense.date).toISOString().split('T')[0]
      : null;

    this.expenseForm.patchValue({
      ...expense,
      date: formattedDate,
      category: expense.category?.id || 'Outros',
      attachments: expense.attachments || []
    });
  }

  saveExpense() {
    if (this.expenseForm.valid && this.editingExpense()) {
      const formValue = this.expenseForm.value;
      const editing = this.editingExpense()!;

      // Monta FormData para multipart/form-data
      const formData = new FormData();
      formData.append('description', formValue.description);
      formData.append('status', formValue.status);

      // Força enviar só o ID da categoria
      const categoryId = typeof formValue.category === 'object'
        ? formValue.category.id
        : formValue.category;
      formData.append('category_id', String(categoryId));

      formData.append('amount', String(formValue.amount));
      formData.append('date', formValue.date); // formato YYYY-MM-DD

      // Arquivos existentes do backend (se precisar enviar ids para backend)
      if (this.existingFiles?.length) {
        this.existingFiles.forEach(f => formData.append('existing_file_ids', f.id));
      }

      // Novos arquivos adicionados pelo usuário
      if (this.newFiles?.length) {
        this.newFiles.forEach(f => formData.append('files', f));
      }

      // Chama o backend
      this.expenseService.updateExpense(formData, Number(editing.id)).subscribe({
        next: (savedExpense) => {
          // Atualiza a lista local
          this.expenses.update(exps =>
            exps.map(e => e.id === savedExpense.id ? savedExpense : e)
          );

          // Limpa seleção de arquivos
          this.newFiles = [];
          this.existingFiles = savedExpense.attachments || [];

          this.cancelEditExpense();
          this.notificationService.success('Despesa atualizada com sucesso!');
        },
        error: (err) => {
          console.error('Erro ao atualizar despesa', err);
          this.notificationService.error('Erro ao atualizar a despesa.');
        }
      });
    }
  }

  cancelEditExpense() {
    this.editingExpense.set(null);
    this.isExpenseFormCollapsed.set(true);
    this.expenseForm.reset({
      category: 'Outros',
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      status: 'pending',
      attachments: []
    });
  }

  deleteExpense(id: string) {
    // chama o backend para deletar
    this.expenseService.deleteExpense(id).subscribe({
      next: () => {
        // atualiza a lista local
        this.expenses.update(exps => exps.filter(e => e.id !== id));
        this.notificationService.info('Despesa removida com sucesso.');
        this.loadExpenses();
      },
      error: (err) => {
        console.error('Erro ao deletar despesa', err);
        this.notificationService.error('Erro ao remover despesa.');
      }
    });
  }


  // Cost Center CRUD
  addCostCenter() {
    if (this.costCenterForm.valid) {

      const formValue = this.costCenterForm.getRawValue();

      const payload = {
        name: formValue.name,
        code: formValue.code,
        description: formValue.description,
        properties: (formValue.properties || []).map((p: any) => ({
          name: p.name,
          value: p.value != null ? String(p.value) : "0",
          type: p.type
        }))
      };

      this.costCenterService.create(payload)
        .subscribe({
          next: (created) => {

            // adiciona na lista local com retorno do backend
            this.costCenters.update(ccs => [...ccs, created]);

            this.costCenterForm.reset({ active: true });
            this.costCenterProperties.clear();
            this.isCostCenterFormCollapsed.set(true);

            this.notificationService.success(
              'Centro de custo adicionado com sucesso!'
            );
          },
          error: () => {
            this.notificationService.error(
              'Erro ao adicionar centro de custo'
            );
          }
        });
    }
  }

  editCostCenter(cc: CostCenter) {
    this.isCostCenterFormCollapsed.set(false);
    this.editingCostCenter.set(cc);
    this.costCenterForm.patchValue({
      name: cc.name,
      code: cc.code,
      description: cc.description,
      active: cc.active
    });

    this.costCenterProperties.clear();
    if (cc.properties) {
      cc.properties.forEach(prop => {
        this.costCenterProperties.push(this.fb.group({
          name: [prop.name, Validators.required],
          value: [prop.value, Validators.required],
          type: [prop.type, Validators.required]
        }));
      });
    }
  }


  saveCostCenter() {
    if (this.costCenterForm.valid && this.editingCostCenter()) {

      const formValue = this.costCenterForm.getRawValue();

      const payload = {
        id: this.editingCostCenter()!.id,
        name: formValue.name,
        code: formValue.code,
        description: formValue.description,
        active: !!formValue.active,
        properties: (formValue.properties || []).map((p: any) => ({
          name: p.name,
          value: p.value != null ? String(p.value) : "0",
          type: p.type
        }))
      };

      this.costCenterService.update(payload)
        .subscribe({
          next: (updated) => {

            // atualizar lista local
            this.costCenters.update(ccs =>
              ccs.map(c => c.id === updated.id ? updated : c)
            );

            this.cancelEditCostCenter();

            this.notificationService.success(
              'Centro de custo atualizado com sucesso!'
            );
          },
          error: () => {
            this.notificationService.error(
              'Erro ao atualizar centro de custo'
            );
          }
        });
    }
  }


  cancelEditCostCenter() {
    this.editingCostCenter.set(null);
    this.costCenterForm.reset({ active: true });
    this.costCenterProperties.clear();
    this.isCostCenterFormCollapsed.set(true);
  }

  deleteCostCenter(id: string) {
    this.costCenters.update(ccs => ccs.filter(c => c.id !== id));
    this.notificationService.info('Centro de custo removido.');
  }

  toggleCostCenterStatus(cc: CostCenter) {
    this.costCenters.update(ccs => ccs.map(c => c.id === cc.id ? { ...c, active: !c.active } : c));
    this.notificationService.success(`Status do centro de custo ${cc.name} alterado.`);
  }

  toggleExpenseStatus(expense: ExpenseItem) {
    const newStatus = expense.status === 'paid' ? 'pending' : 'paid';
    this.expenses.update(exps => exps.map(e => e.id === expense.id ? { ...e, status: newStatus } : e));
    this.notificationService.success(`Status alterado para ${newStatus === 'paid' ? 'Pago' : 'Pendente'}`);
  }

  viewAttachments(expense: ExpenseItem) {
    if (expense.attachments && expense.attachments.length > 0) {
      this.viewingExpenseAttachments.set(expense);
    }
  }

  closeAttachmentViewer() {
    this.viewingExpenseAttachments.set(null);
  }

  downloadAttachment(attachment: ExpenseAttachment) {
    const link = document.createElement('a');
    link.href = attachment.url;
    link.download = attachment.id;
    link.click();
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }




}
