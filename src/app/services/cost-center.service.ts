import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../src/environment';




export interface CostCenter {
    id: string;
    name: string;
    code: string;
    description: string;
    active: boolean;
    properties?: CostCenterProperty[];
}

export interface CostCenterProperty {
    name: string;
    value: string;
    type: 'index' | 'value';
}

@Injectable({
    providedIn: 'root'
})
export class CostCenterService {
    constructor(private http: HttpClient) { }
    private API = `${environment.API_URL}/cost-centers`;

    findAll(): Observable<CostCenter[]> {
        return this.http.get<CostCenter[]>(this.API)
    }

    create(costCenter: any) {
        return this.http.post<CostCenter>(this.API, costCenter);
    }

    update(costCenter: any) {
        return this.http.put<CostCenter>(`${this.API}/`, costCenter);
    }

}