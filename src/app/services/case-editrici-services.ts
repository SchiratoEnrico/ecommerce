import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CasaEditrice } from '../models/casa-editrice';

@Injectable({
  providedIn: 'root',
})
export class CaseEditriciServices {
  private url = 'http://localhost:9090/rest/casa_editrice';
    
  constructor(private http:HttpClient) {}

  caseEditrici = signal<CasaEditrice[]>([]);
  
  listCaseEditrici(params?: any): Observable<CasaEditrice[]> {
    return this.http.get<CasaEditrice[]>(`${this.url}/list`, { params });
  }

  create(casaEditrice: Omit<CasaEditrice, 'id'>): Observable<any> {
    return this.http.post(`${this.url}/create`, casaEditrice);
  }

  update(casaEditrice: CasaEditrice): Observable<any> {
    return this.http.put(this.url + "/update", casaEditrice);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.url}/delete/${id}`);
  }

  findById(id: number): Observable<any> {
    return this.http.get(`${this.url}/findById`, {
      params: { id }
    });
  }

}
