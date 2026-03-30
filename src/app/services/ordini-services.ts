import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { Spedizione } from '../models/spedizione.model';

export interface Ordine {

  id: number;
//  account: Account;           
//  pagamento: Pagamento;         
  spedizione: Spedizione;        
  data: string | Date;    
//  stato: statoOrdine;             
//  righeOrdine: any[];


}


@Injectable({
  providedIn: 'root',
})
export class OrdiniServices {

private url = 'http://localhost:9090/rest/ordine';

  // Signal per gestire lo stato degli ordini in modo reattivo
  ordini = signal<Ordine[]>([]);

  constructor(private http: HttpClient) {}

  list(): Observable<Ordine[]> {
    return this.http.get<Ordine[]>(`${this.url}/list`);
  }

  findById(id: number): Observable<Ordine> {
    return this.http.get<Ordine>(`${this.url}/findById`, { params: { id } });
  }

  // Crea un nuovo ordine (Omit rimuove l'id perché è generato dal DB)
  create(ordine: Omit<Ordine, 'id'>): Observable<any> {
    return this.http.post(`${this.url}/create`, ordine);
  }

  update(ordine: Ordine): Observable<any> {
    return this.http.put(`${this.url}/update`, ordine);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.url}/delete`, { params: { id } });
  }
}
