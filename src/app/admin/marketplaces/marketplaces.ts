import { ChangeDetectionStrategy, Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { NotificationService } from '../../shared/services/notification';
import { Marketplace } from './marketplaces.model';
import { MarketplacesService } from '../../services/marketplaces.service';

@Component({
  selector: 'app-marketplaces',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule],
  templateUrl: './marketplaces.html',
  styleUrls: ['./marketplaces.css', '../admin-shared.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Marketplaces implements OnInit {
  private fb = inject(FormBuilder);
  private notificationService = inject(NotificationService);
  private marketplacesService = inject(MarketplacesService);

  ngOnInit() {
    this.loadMarketplaces();
  }

  loadMarketplaces() {
    this.marketplacesService.findAll().subscribe({
      next: (data) => this.marketplaces.set(data),
      error: () => this.notificationService.error('Erro ao carregar marketplaces')
    });
  }

  marketplaces = signal<Marketplace[]>([]);

  searchTerm = signal('');
  statusFilter = signal<'all' | 'active' | 'inactive'>('all');

  filteredMarketplaces = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const status = this.statusFilter();

    return this.marketplaces().filter(m => {
      const matchesSearch = m.name.toLowerCase().includes(term);
      const matchesStatus = status === 'all' || m.status === status;
      return matchesSearch && matchesStatus;
    });
  });

  marketplaceForm: FormGroup;
  isFormVisible = signal(false);
  editingMarketplace = signal<Marketplace | null>(null);

  constructor() {
    this.marketplaceForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      logo: [''],
      status: ['active', Validators.required],
      commissionRate: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
      integrationType: ['manual', Validators.required],
      apiUrl: [''],
      apiKey: [''],
      apiEndpoint: [''],
      apiSecret: ['']
    });
  }

  showAddForm() {
    this.editingMarketplace.set(null);
    this.marketplaceForm.reset({
      status: 'active',
      commissionRate: 0,
      integrationType: 'manual'
    });
    this.isFormVisible.set(true);
  }

  editMarketplace(marketplace: Marketplace) {
    this.editingMarketplace.set(marketplace);
    this.marketplaceForm.patchValue(marketplace);
    this.isFormVisible.set(true);
  }

  cancelForm() {
    this.isFormVisible.set(false);
    this.editingMarketplace.set(null);
    this.marketplaceForm.reset();
  }

  saveMarketplace() {
    if (this.marketplaceForm.invalid) return;

    const formValue = this.marketplaceForm.value;
    const editing = this.editingMarketplace();

    if (editing) {
      this.marketplacesService.update(editing.id, formValue).subscribe({
        next: (updated) => {
          this.marketplaces.update(list =>
            list.map(m => m.id === editing.id ? updated : m)
          );
          this.notificationService.success('Marketplace atualizado com sucesso!');
          this.cancelForm();
        },
        error: () => this.notificationService.error('Erro ao atualizar')
      });

    } else {
      this.marketplacesService.create(formValue).subscribe({
        next: (created) => {
          this.marketplaces.update(list => [created, ...list]);
          this.notificationService.success('Marketplace criado com sucesso!');
          this.cancelForm();
        },
        error: () => this.notificationService.error('Erro ao criar')
      });
    }
  }

  deleteMarketplace(id: string) {
    if (!confirm('Tem certeza que deseja excluir este marketplace?')) return;

    this.marketplacesService.delete(id).subscribe({
      next: () => {
        this.marketplaces.update(list => list.filter(m => m.id !== id));
        this.notificationService.success('Marketplace excluído com sucesso!');
      },
      error: () => this.notificationService.error('Erro ao excluir')
    });
  }

  toggleStatus(marketplace: Marketplace) {
    const newStatus = marketplace.status === 'active' ? 'inactive' : 'active';

    this.marketplacesService.update(marketplace.id, {
      ...marketplace,
      status: newStatus
    }).subscribe({
      next: (updated) => {
        this.marketplaces.update(list =>
          list.map(m => m.id === marketplace.id ? updated : m)
        );
        this.notificationService.success(
          `Marketplace ${newStatus === 'active' ? 'ativado' : 'desativado'}!`
        );
      },
      error: () => this.notificationService.error('Erro ao atualizar status')
    });
  }

}
