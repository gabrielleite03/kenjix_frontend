import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../src/environment';

export interface Category {
  id: string;
  name: string;
  description: string;
  active: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  private API = `${environment.API_URL}/categories`;
  private API_CATEGORY = `${environment.API_URL}/category`;

  constructor(private http: HttpClient) {}
  
  findAll(): Observable<Category[]> {
    const token = localStorage.getItem('kenji_token');
    return this.http.get<Category[]>(this.API, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
        }
    });
  }

    save(category: any) {
    const token = localStorage.getItem('kenji_token');
    return this.http.post<Category>(this.API_CATEGORY, category, {
        headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
        }
    });
    }
update(category: any) {
  const token = localStorage.getItem('kenji_token');
  return this.http.put<Category>(
    `${this.API}/${category.id}`,
    category,
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    }
  );
}
}