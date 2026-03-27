import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Ordine } from '../models/ordine.model';

@Injectable({
  providedIn: 'root',
})

export class OrdiniServices {
private url = 'http://localhost:9090/rest/ordine';

constructor(private http: HttpClient) {}
ordini = signal<Ordine[]>([]);

  list(params?: any): Observable<Ordine[]> {
    return this.http.get<Ordine[]>(`${this.url}/list`, { params });
  }

  create(ordine: Omit<Ordine, 'id'>): Observable<any> {
    return this.http.post(`${this.url}/create`, ordine);
  }

  update(ordine: Ordine): Observable<any> {
    return this.http.put(`${this.url}/update`, ordine);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.url}/delete/${id}`);
  }

  findById(id: number): Observable<any> {
    return this.http.get(`${this.url}/findById`, {
      params: { id }
    });
  }
}
