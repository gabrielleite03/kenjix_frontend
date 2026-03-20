import {ChangeDetectionStrategy, Component, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatIconModule} from '@angular/material/icon';
import {FormsModule} from '@angular/forms';
import {RouterModule} from '@angular/router';

interface Supplier {
  id: string;
  razaoSocial: string;
  nomeFantasia: string;
  cnpj: string;
  ie: string;
  address: string;
  salesperson: string;
  category: string;
  email: string;
  phone: string;
  status: 'Ativo' | 'Inativo';
}

@Component({
  selector: 'app-suppliers',
  standalone: true,
  imports: [CommonModule, MatIconModule, FormsModule, RouterModule],
  templateUrl: './suppliers.html',
  styleUrls: ['./suppliers.css', '../admin-shared.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Suppliers {
  searchTerm = signal('');
  
  suppliers = signal<Supplier[]>([
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
    {
      id: '3',
      razaoSocial: 'ToyDog Industria de Brinquedos EIRELI',
      nomeFantasia: 'ToyDog Brinquedos',
      cnpj: '11.222.333/0001-44',
      ie: '111.222.333.444',
      address: 'Rua do Lazer, 789 - Campinas, SP',
      salesperson: 'Ricardo Santos',
      category: 'Acessórios',
      email: 'comercial@toydog.com.br',
      phone: '(11) 96666-5555',
      status: 'Inativo'
    },
    {
      id: '4',
      razaoSocial: 'MedVet Distribuidora de Medicamentos Veterinarios',
      nomeFantasia: 'MedVet Medicamentos',
      cnpj: '55.666.777/0001-88',
      ie: '555.666.777.888',
      address: 'Rua da Saude, 101 - Osasco, SP',
      salesperson: 'Dra. Marina',
      category: 'Saúde',
      email: 'pedidos@medvet.com.br',
      phone: '(11) 95555-4444',
      status: 'Ativo'
    }
  ]);

  filteredSuppliers = () => {
    const term = this.searchTerm().toLowerCase();
    if (!term) return this.suppliers();
    return this.suppliers().filter(s => 
      s.nomeFantasia.toLowerCase().includes(term) || 
      s.razaoSocial.toLowerCase().includes(term) ||
      s.cnpj.toLowerCase().includes(term) ||
      s.category.toLowerCase().includes(term) ||
      s.salesperson.toLowerCase().includes(term)
    );
  };

  getStatusClass(status: string) {
    return status === 'Ativo' 
      ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
      : 'bg-slate-50 text-slate-500 border-slate-100';
  }
}
