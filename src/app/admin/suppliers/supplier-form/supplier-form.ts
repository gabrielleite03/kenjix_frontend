import {ChangeDetectionStrategy, Component, OnInit, inject, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatIconModule} from '@angular/material/icon';
import {ReactiveFormsModule, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router, RouterModule} from '@angular/router';

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
      category: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required]],
      status: ['Ativo', [Validators.required]]
    });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.loadSupplier(id);
    }
  }

  loadSupplier(id: string) {
    // Mock loading data
    const mockSuppliers = [
      { 
        id: '1', 
        razaoSocial: 'PetFood Comercio de Alimentos LTDA',
        nomeFantasia: 'PetFood Distribuidora',
        cnpj: '12.345.678/0001-90',
        ie: '123.456.789.110',
        address: 'Rua das Rações, 123 - São Paulo, SP',
        salesperson: 'Carlos Oliveira',
        category: 'Alimentação', 
        email: 'contato@petfood.com.br', 
        phone: '(11) 98888-7777', 
        status: 'Ativo' 
      },
      { 
        id: '2', 
        razaoSocial: 'CleanPet Produtos de Higiene S.A.',
        nomeFantasia: 'CleanPet Higiene',
        cnpj: '98.765.432/0001-10',
        ie: '987.654.321.000',
        address: 'Av. da Limpeza, 456 - Guarulhos, SP',
        salesperson: 'Ana Souza',
        category: 'Higiene', 
        email: 'vendas@cleanpet.com', 
        phone: '(11) 97777-6666', 
        status: 'Ativo' 
      },
    ];
    const supplier = mockSuppliers.find(s => s.id === id);
    if (supplier) {
      this.supplierForm.patchValue(supplier);
    }
  }

  onSubmit() {
    if (this.supplierForm.valid) {
      console.log('Supplier data:', this.supplierForm.value);
      // Logic to save or update
      this.router.navigate(['/admin/suppliers']);
    }
  }
}
