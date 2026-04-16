import { environment } from '../../../src/environment';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ExpenseAttachment {
    id: string;
    url: string;
    type: string
}

export interface ExpenseItem {
    id: string;
    description: string;
    category: ExpenseCategory;
    amount: number;
    date: string;
    status: 'paid' | 'pending';
    attachments?: ExpenseAttachment[];
}

export interface ExpenseCategory {
    id: number;
    name: string;
}

@Injectable({
    providedIn: 'root'
})
export class ExpenseService {
    constructor(private http: HttpClient) { }
    private API = `${environment.API_URL}/expenses`;
    private API_CAT = `${environment.API_URL}/expenses/categories`;


    addExpense(formData: FormData) {
        return this.http.post(this.API, formData);
    }

    findAll(): Observable<ExpenseItem[]> {
        return this.http.get<ExpenseItem[]>(this.API);
    }

    findAllExpensesCategories(): Observable<ExpenseCategory[]> {
        return this.http.get<ExpenseCategory[]>(this.API_CAT);
    }

    updateExpense(formData: FormData, id: number) {
        return this.http.put<ExpenseItem>(`${this.API}/${id}`, formData);
    }

    deleteExpense(id: string) {
        return this.http.delete(`${this.API}/${id}`);
    }
}