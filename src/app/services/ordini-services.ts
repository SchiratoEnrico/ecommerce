import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { Spedizione } from '../models/spedizione';
import { Ordine } from '../models/ordine';

@Injectable({
  providedIn: 'root',
})


export class OrdiniServices {
  private url = 'http://localhost:9090/rest/ordine';

  // Signal per gestire lo stato degli ordini in modo reattivo
  ordini = signal<Ordine[]>([]);

  constructor(private http: HttpClient) {}

  createOrdineFromCarrello(
    carrelloId: number, 
    anagraficaId: number, 
    tipoPagamentoId: number, 
    tipoSpedizioneId: number
  ): Observable<any> {
    const params = new HttpParams()
      .set('carrelloId', carrelloId)
      .set('anagraficaId', anagraficaId)
      .set('tipoPagamentoId', tipoPagamentoId)
      .set('tipoSpedizioneId', tipoSpedizioneId);
      
    return this.http.post<any>(`${this.url}/create_ordine_from_carrello`, null, { params });
  }

  getLastCreated(){
    return this.http.get<any>(`${this.url}/last_created`);
  }

  avanzaStatoOrdine(ordineId: number, statoId: number){
    const params = new HttpParams()
      .set('ordineId', ordineId)
      .set('statoId', statoId);
    return this.http.put<any>(`${this.url}/avanza_stato_ordine`, null, { params });
  }

  list(params?: any): Observable<Ordine[]> {
    return this.http.get<Ordine[]>(`${this.url}/list`, { params });
  }

  findById(id: number): Observable<Ordine> {
    return this.http.get<Ordine>(`${this.url}/findById`, { params: { id } });
  }

  findByAccountId(accountId: number): Observable<Ordine[]>{
    return this.http.get<Ordine[]>(`${this.url}/findByAccountId`, { params: { accountId } });
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
