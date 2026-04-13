import { Injectable, signal } from '@angular/core';
import { RigaFattura } from '../models/riga-fattura';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RigaFatturaServices {

   private url = 'http://localhost:9090/rest/riga_fattura';

  fatture = signal<RigaFattura[]>([]);

  constructor(private http: HttpClient) {}

  list(): Observable<RigaFattura[]> {
    return this.http.get<RigaFattura[]>(`${this.url}/list`);
  }

  findById(id: number): Observable<RigaFattura> {
    return this.http.get<RigaFattura>(`${this.url}/findById`, { params: { id } });
  }

  create(fattura: Omit<RigaFattura, 'id'>): Observable<any> {
    return this.http.post(`${this.url}/create`, fattura);
  }

  update(fattura: RigaFattura): Observable<any> {
    return this.http.put(`${this.url}/update`, fattura);
  }

  delete(id: number): Observable<any> {
  return this.http.delete(`${this.url}/delete/${id}`); // ← path variable
}


}
