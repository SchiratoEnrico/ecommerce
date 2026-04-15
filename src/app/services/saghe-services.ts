import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Saga } from '../models/saga';
import { Observable } from 'rxjs';

export interface SagaFilters {
  sagaId?:         number | null;
  casaEditriceId?: number | null;
  autoreId?:       number | null;
  generiId?:       number[];
}


@Injectable({
  providedIn: 'root',
})
export class SagheServices {
  private url = 'http://localhost:9090/rest/saga';
  saghe = signal<Saga[]>([]);

  constructor(private http:HttpClient) {}

  
  listSaghe(filters?: SagaFilters): Observable<Saga[]> {
    let params = new HttpParams();
    if (filters) {
      if (filters.sagaId != null) 
        params = params.set('sagaId', filters.sagaId);
      if (filters.casaEditriceId != null) 
        params = params.set('casaEditriceId', filters.casaEditriceId);
      if (filters.autoreId != null) 
        params = params.set('autoreId', filters.autoreId);
      if (filters.generiId?.length) {
        filters.generiId.forEach(id =>
          params = params.append('generiId', id)
          );
      }
    }
    return this.http.get<Saga[]>(`${this.url}/list`, {params});
  }

    create(saga: Omit<Saga, 'id'>): Observable<any> {
      // Omit<Saga, 'id'> interfaccia saga - campo id, adatto a create
      return this.http.post(`${this.url}/create`, saga);
    }
  
    update(saga: Saga): Observable<any> {
      return this.http.put(this.url + "/update", saga);
    }
  
    delete(id: number): Observable<any> {
      return this.http.delete(`${this.url}/delete/${id}`);
    }
  
}
