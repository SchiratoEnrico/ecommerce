import { Injectable, signal } from '@angular/core';
import { Fattura } from '../models/fattura';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FattureServices {

  private url = 'http://localhost:9090/rest/fattura';

  fatture = signal<Fattura[]>([]);

  constructor(private http: HttpClient) {}

  list(params?: any): Observable<Fattura[]> {
      return this.http.get<Fattura[]>(`${this.url}/list`, { params });
    }

  findById(id: number): Observable<Fattura> {
    return this.http.get<Fattura>(`${this.url}/findById`, { params: { id } });
  }

  create(fattura: Omit<Fattura, 'id'>): Observable<number> { 
  return this.http.post<number>(`${this.url}/create`, fattura);
}

  update(fattura: Fattura): Observable<any> {
    return this.http.put(`${this.url}/update`, fattura);
  }

  delete(id: number): Observable<any> {
  return this.http.delete(`${this.url}/delete/${id}`);
}

  //Reso
  confermaReso(id: number): Observable<any> {
  return this.http.put(`${this.url}/reso/conferma`, null, { params: { fatturaId: id } });
}

rifiutaReso(id: number): Observable<any> {
  return this.http.put(`${this.url}/reso/rifiuta`, null, { params: { fatturaId: id } });
}

rimborsa(id: number, ripristina: boolean): Observable<any> {
  return this.http.put(`${this.url}/reso/rimborso`, null, { 
    params: { fatturaId: id, ripristinaCopie: ripristina } 
  });
}

}
