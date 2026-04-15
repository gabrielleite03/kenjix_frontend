import { environment } from '../../../../src/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CategoryService, Category } from '../../services/category.service';

export interface Supplier {
    id: number;
    razaoSocial: string;
    nomeFantasia: string;
    cnpj: string;
    ie: string;
    address: string;
    salesperson: string;
    category: Category;
    categoryId: number;
    email: string;
    phone: string;
    active: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class SupplierService {
    constructor(private http: HttpClient) { }
    private API = environment.API_URL;


    getSuppliers(): Observable<Supplier[]> {
        return this.http.get<Supplier[]>(`${this.API}/suppliers`);
    }

    findById(id: string) {
        return this.http.get<Supplier>(`${this.API}/suppliers/${id}`);
    }

    addSupplier(supplier: Supplier): Observable<Supplier> {
        return this.http.post<Supplier>(`${this.API}/suppliers`, supplier);
    }

    updateSupplier(id: string, supplier: Supplier): Observable<void> {
        return this.http.put<void>(`${this.API}/suppliers/${id}`, supplier);
    }
}