import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CategoryService, Category } from '../../../services/category.service';
import { SupplierService, Supplier } from '../supplier.service';
import { NotificationService } from '../../../shared/services/notification';

@Component({
  selector: 'app-supplier-form',
  standalone: true,
  imports: [CommonModule, MatIconModule, ReactiveFormsModule, RouterModule],
  templateUrl: './supplier-form.html',
  styleUrls: ['../../admin-shared.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SupplierForm implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private CategoryService = inject(CategoryService);
  private supplierService = inject(SupplierService);
  categories = signal<Category[]>([]);
  private notificationService = inject(NotificationService);

  isEditMode = signal(false);
  supplierForm: FormGroup;

  constructor() {
    this.supplierForm = this.fb.group({
      razaoSocial: ['', [Validators.required]],
      nomeFantasia: ['', [Validators.required]],
      cnpj: ['', [Validators.required]],
      ie: ['', [Validators.required]],
      address: ['', [Validators.required]],
      salesperson: ['', [Validators.required]],
      categoryId: [null as number | null],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required]],
      active: [true, [Validators.required]]
    });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    console.log('ID da rota:', id);

    this.loadCategories();

    if (id) {
      this.isEditMode.set(true);
      this.loadSupplier(id);
    }
  }

  loadCategories(callback?: () => void) {
    this.CategoryService.findAll()
      .subscribe({
        next: (data) => {
          this.categories.set(data);
          callback?.(); // executa somente se existir
        },
        error: (err) => {
          console.error('Erro ao carregar categorias', err);
        }
      });
  }

  loadSupplier(id: string) {
    this.supplierService.findById(id).subscribe({
      next: (supplier) => {

        const categoryId = Number(supplier.categoryId);


        this.supplierForm.patchValue({
          razaoSocial: supplier.razaoSocial,
          nomeFantasia: supplier.nomeFantasia,
          cnpj: supplier.cnpj,
          ie: supplier.ie,
          address: supplier.address,
          salesperson: supplier.salesperson,
          categoryId: categoryId,
          email: supplier.email,
          phone: supplier.phone,
          active: supplier.active
        });

      },
      error: (err) => {
        console.error('Erro ao carregar fornecedor', err);
      }
    });
  }

  onSubmit() {
    if (!this.supplierForm.valid) return;

    if (this.isEditMode()) {
      this.updateSupplier();
    } else {
      this.addSupplier();
    }
  }

  addSupplier() {
    this.supplierService.addSupplier(this.supplierForm.value)
      .subscribe({
        next: () => {
          this.notificationService.success('Fornecedor adicionado com sucesso!');
          this.router.navigate(['/admin/suppliers']);
        },
        error: () => this.notificationService.success('Erro ao salvar fornecedor')
      });
  }

  updateSupplier() {
    const id = this.route.snapshot.paramMap.get('id');

    this.supplierService.updateSupplier(id!, this.supplierForm.value)
      .subscribe({
        next: () => {
          this.notificationService.success('Fornecedor atualizado com sucesso!');
          this.router.navigate(['/admin/suppliers']);
        },
        error: () => this.notificationService.success('Erro ao atualizar fornecedor')
      });
  }
}
