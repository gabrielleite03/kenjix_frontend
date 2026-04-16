import {ChangeDetectionStrategy, Component, signal, inject, computed} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatIconModule} from '@angular/material/icon';
import {FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {InvoiceService, InvoiceItem} from './invoice.service';

@Component({
  selector: 'app-invoices',
  standalone: true,
  imports: [CommonModule, MatIconModule, FormsModule, ReactiveFormsModule],
  templateUrl: './invoices.html',
  styleUrls: ['./invoices.css', '../admin-shared.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Invoices {
  private fb = inject(FormBuilder);
  private invoiceService = inject(InvoiceService);

  invoices = this.invoiceService.invoices;
  isFormOpen = signal(false);
  editingInvoice = signal<InvoiceItem | null>(null);
  searchTerm = signal('');

  invoiceForm: FormGroup = this.fb.group({
    number: ['', [Validators.required]],
    series: ['1', [Validators.required]],
    type: ['saida', [Validators.required]],
    issueDate: [new Date().toISOString().split('T')[0], [Validators.required]],
    supplierOrCustomer: ['', [Validators.required]],
    totalValue: [0, [Validators.required, Validators.min(0)]],
    status: ['emitida', [Validators.required]]
  });

  filteredInvoices = computed(() => {
    const term = this.searchTerm().toLowerCase();
    return this.invoices().filter(i => 
      i.number.toLowerCase().includes(term) || 
      i.supplierOrCustomer.toLowerCase().includes(term)
    );
  });

  openForm(invoice?: InvoiceItem) {
    if (invoice) {
      this.editingInvoice.set(invoice);
      this.invoiceForm.patchValue({
        ...invoice,
        issueDate: new Date(invoice.issueDate).toISOString().split('T')[0]
      });
    } else {
      this.editingInvoice.set(null);
      this.invoiceForm.reset({
        series: '1',
        type: 'saida',
        issueDate: new Date().toISOString().split('T')[0],
        status: 'emitida',
        totalValue: 0
      });
    }
    this.isFormOpen.set(true);
  }

  closeForm() {
    this.isFormOpen.set(false);
    this.editingInvoice.set(null);
  }

  saveInvoice() {
    if (this.invoiceForm.valid) {
      const formValue = this.invoiceForm.value;
      const invoiceData = {
        ...formValue,
        issueDate: new Date(formValue.issueDate)
      };

      if (this.editingInvoice()) {
        this.invoiceService.updateInvoice(this.editingInvoice()!.id, invoiceData);
      } else {
        this.invoiceService.addInvoice(invoiceData);
      }
      this.closeForm();
    }
  }

  deleteInvoice(id: string) {
    if (confirm('Tem certeza que deseja excluir esta nota fiscal?')) {
      this.invoiceService.deleteInvoice(id);
    }
  }

  getStatusClass(status: string) {
    switch (status) {
      case 'emitida': return 'bg-emerald-100 text-emerald-700';
      case 'cancelada': return 'bg-rose-100 text-rose-700';
      case 'pendente': return 'bg-amber-100 text-amber-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  }
}
