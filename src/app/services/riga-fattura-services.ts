import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RigaFatturaServices {
  private url = 'http://localhost:9090/rest/riga_fattura';

  fatture = signal<any[]>([]);

  constructor(private http: HttpClient) {}

  list(): Observable<any[]> {
    return this.http.get<any[]>(`${this.url}/list`);
  }

  findById(id: number): Observable<any> {
    return this.http.get<any>(`${this.url}/findById`, { params: { id } });
  }

  create(fattura: any): Observable<any> {
    return this.http.post(`${this.url}/create`, fattura);
  }

  update(fattura: any): Observable<any> {
    return this.http.put(`${this.url}/update`, fattura);
  }
}