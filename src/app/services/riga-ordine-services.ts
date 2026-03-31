import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { RigaOrdine } from '../models/riga-ordine';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RigaOrdineServices {
  private url = 'http://localhost:9090/rest/riga_ordine';

  constructor(private http: HttpClient) {}

  list(idOrdine?: number): Observable<RigaOrdine[]> {
    const params: any = {};
    if (idOrdine) params.idOrdine = idOrdine;
    return this.http.get<RigaOrdine[]>(`${this.url}/list`, { params });
  }

 create(body: Omit<RigaOrdine, 'id'>): Observable<any> {
    return this.http.post(`${this.url}/create`, body);
  }

  update(body: RigaOrdine): Observable<any> {
    return this.http.put(`${this.url}/update`, body);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.url}/delete/${id}`);
  }
}
