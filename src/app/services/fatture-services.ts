import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FattureServices {
  private url = 'http://localhost:9090/rest/fattura';

  fatture = signal<any[]>([]);

  constructor(private http: HttpClient) {}

  list(params?: any): Observable<any[]> {
      return this.http.get<any[]>(`${this.url}/list`, { params });
    }

  findById(id: number): Observable<any> {
    return this.http.get<any>(`${this.url}/findById`, { params: { id } });
  }

  create(fattura: Omit<any, 'id'>): Observable<number> { 
    return this.http.post<number>(`${this.url}/create`, fattura);
  }

  findByAccountId(accountId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.url}/listByAccount`, { params: { id: accountId } });
  }
}
