import {ChangeDetectionStrategy, Component} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatIconModule} from '@angular/material/icon';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css', '../admin-shared.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dashboard {
  stats = [
    { label: 'Total de Produtos', value: '1,284', icon: 'inventory_2', color: 'bg-blue-500' },
    { label: 'Vendas Hoje', value: 'R$ 3,420', icon: 'payments', color: 'bg-emerald-500' },
    { label: 'Alertas de Estoque', value: '12', icon: 'warning', color: 'bg-amber-500' },
    { label: 'Novos Clientes', value: '8', icon: 'person_add', color: 'bg-purple-500' },
  ];

  recentActivities = [
    { type: 'sale', title: 'Venda Realizada', description: 'Ração Premium 15kg - R$ 189,90', time: 'há 5 min' },
    { type: 'stock', title: 'Estoque Baixo', description: 'Brinquedo Mordedor está com 2 unidades', time: 'há 15 min' },
    { type: 'product', title: 'Novo Produto', description: 'Shampoo Antipulgas cadastrado', time: 'há 1 hora' },
  ];
}
