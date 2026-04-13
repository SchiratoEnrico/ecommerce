import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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
    return this.http.get<any>(`${this.url}/findById`, { params: { idFattura: id } });
  }

  create(fattura: any): Observable<number> { 
    return this.http.post<number>(`${this.url}/create`, fattura);
  }

  findByAccountId(accountId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.url}/listByAccount`, { params: { id: accountId } });
  }

  update(fattura: any): Observable<any> {
    return this.http.put(`${this.url}/update`, fattura);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.url}/delete/${id}`);
  }

  // --- Gestione Reso ---

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