import { ChangeDetectionStrategy, Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SupplierService, Supplier } from './supplier.service';


@Component({
  selector: 'app-suppliers',
  standalone: true,
  imports: [CommonModule, MatIconModule, FormsModule, RouterModule],
  templateUrl: './suppliers.html',
  styleUrls: ['./suppliers.css', '../admin-shared.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Suppliers implements OnInit {
  private supplierService = inject(SupplierService);
  suppliers = signal<Supplier[]>([]);
  searchTerm = signal('');

  ngOnInit() {
    this.loadSuppliers();
  }

  filteredSuppliers = () => {
    const term = this.searchTerm().toLowerCase();
    if (!term) return this.suppliers();
    return this.suppliers().filter(s =>
      s.nomeFantasia.toLowerCase().includes(term) ||
      s.razaoSocial.toLowerCase().includes(term) ||
      s.cnpj.toLowerCase().includes(term) ||
      s.category.name?.toLowerCase().includes(term) ||
      s.salesperson.toLowerCase().includes(term)
    );
  };

  getStatusClass(active: boolean) {
    return active === true
      ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
      : 'bg-slate-50 text-slate-500 border-slate-100';
  }

  loading = signal(true);

  loadSuppliers() {
    this.loading.set(true);

    this.supplierService.getSuppliers()
      .subscribe({
        next: (data) => {
          this.suppliers.set(data);
          this.loading.set(false);
        },
        error: (err) => {
          console.error('Erro ao carregar suppliers', err);
          this.loading.set(false);
        }
      });
  }
}
