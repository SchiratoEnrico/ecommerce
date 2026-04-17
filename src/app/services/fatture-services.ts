import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Fattura } from '../models/fattura';
import { StatoOrdine } from '../models/stato-ordine';

@Injectable({
  providedIn: 'root',
})
export class FattureServices {
  private url = 'http://localhost:9090/rest/fattura';

  fatture = signal<any[]>([]);

  constructor(private http: HttpClient) {}

  list(params?: any): Observable<Fattura[]> {
    let httpParams: any = {};

    if (params) {
      // copia tutti i parametri normali
      Object.keys(params).forEach(key => {
        if (key !== 'isbns' && params[key] != null && params[key] !== '') {
          httpParams[key] = params[key];
        }
      });

      // isbns va serializzato come array di append
      if (params.isbns?.length) {
        // HttpClient accetta array direttamente come valore
        httpParams['isbns'] = params.isbns;
      }
    }

    return this.http.get<Fattura[]>(`${this.url}/list`, { params: httpParams });
  }

  findById(id: number): Observable<Fattura> {
    return this.http.get<Fattura>(`${this.url}/findById`, { params: { idFattura: id } });
  }

  create(fattura: any): Observable<number> { 
    return this.http.post<number>(`${this.url}/create`, fattura);
  }

  findByAccountId(accountId: number): Observable<Fattura[]> {
    return this.http.get<Fattura[]>(`${this.url}/listByAccount`, { params: { id: accountId } });
  }

  update(fattura: any): Observable<any> {
    return this.http.put(`${this.url}/update`, fattura);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.url}/delete/${id}`);
  }

  // --- Gestione Reso ---

  // --- helpers gestione reso

  getNextAllowedStates(idFattura: number){
    return this.http.get<StatoOrdine[]>(`${this.url}/get_next_allowed_states`, { params: { idFattura: idFattura } });
  }

  allStatiFattura(): Observable<string[]> {
    return this.http.get<string[]>(`${this.url}/all_stati`);
  }

  // ---  gestione stato ordine reso per user

  iniziaReso(fatturaId: number, accountId: number): Observable<any> {
    return this.http.post(`${this.url}/reso/inizia`, null, { 
      params: { fatturaId: fatturaId, accountId: accountId } 
    });
  }

  annullaPagata(fatturaId: number, accountId: number): Observable<any> {
    return this.http.put(`${this.url}/cancella`, null, { 
      params: { fatturaId: fatturaId, accountId: accountId } 
    });
  }

  // ---  gestione stato ordine reso per admin

  avanzaStato(fatturaId: number, nuovoStato: string, ripristinaCopie?: boolean) {
    if (!ripristinaCopie) {
      ripristinaCopie = false;
    }

    return this.http.put(`${this.url}/avanza_stato`, null, { 
      params: { fatturaId: fatturaId, nuovoStato: nuovoStato, ripristinaCopie: ripristinaCopie} 
    });

  }
}