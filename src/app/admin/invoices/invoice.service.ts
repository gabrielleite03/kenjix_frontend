import {Injectable, signal} from '@angular/core';

export interface InvoiceItem {
  id: string;
  number: string;
  series: string;
  type: 'entrada' | 'saida';
  issueDate: Date;
  supplierOrCustomer: string;
  totalValue: number;
  status: 'emitida' | 'cancelada' | 'pendente';
  xmlUrl?: string;
  pdfUrl?: string;
}

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {
  private invoicesSignal = signal<InvoiceItem[]>([
    {
      id: '1',
      number: '000123',
      series: '1',
      type: 'entrada',
      issueDate: new Date('2026-03-15'),
      supplierOrCustomer: 'Distribuidora Pet Feliz',
      totalValue: 1500.50,
      status: 'emitida'
    },
    {
      id: '2',
      number: '000124',
      series: '1',
      type: 'saida',
      issueDate: new Date('2026-03-18'),
      supplierOrCustomer: 'João Silva',
      totalValue: 250.00,
      status: 'emitida'
    },
    {
      id: '3',
      number: '000125',
      series: '1',
      type: 'entrada',
      issueDate: new Date('2026-03-19'),
      supplierOrCustomer: 'Rações & Cia',
      totalValue: 3200.00,
      status: 'pendente'
    }
  ]);

  invoices = this.invoicesSignal.asReadonly();

  addInvoice(invoice: Omit<InvoiceItem, 'id'>) {
    const newInvoice: InvoiceItem = {
      ...invoice,
      id: Math.random().toString(36).substring(2, 9)
    };
    this.invoicesSignal.update(invoices => [newInvoice, ...invoices]);
  }

  updateInvoice(id: string, invoice: Partial<InvoiceItem>) {
    this.invoicesSignal.update(invoices => 
      invoices.map(i => i.id === id ? { ...i, ...invoice } : i)
    );
  }

  deleteInvoice(id: string) {
    this.invoicesSignal.update(invoices => invoices.filter(i => i.id !== id));
  }
}
