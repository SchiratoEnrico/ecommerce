import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { Anagrafica } from '../models/anagrafica';

@Injectable({
  providedIn: 'root',
})
export class AnagraficaService {
  private url = 'http://localhost:9090/rest/anagrafica';

  autori = signal<Anagrafica[]>([]);

  constructor(private http: HttpClient) {}

  findByAccountId(id: number): Observable<Anagrafica[]> {
    return this.http.get<Anagrafica[]>(`${this.url}/findByAccountId`, { params: { id } });
  }

  list(): Observable<Anagrafica[]> {
    return this.http.get<Anagrafica[]>(`${this.url}/list`);
  }

  create(body: {}) {
    return this.http.post(this.url + '/create', body);
  }

  update(body: Anagrafica): Observable<any> {
    return this.http.put(`${this.url}/update`, body);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.url}/delete/${id}`);
  }
}
