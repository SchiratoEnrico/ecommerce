
import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { Genere } from '../models/genere';

@Injectable({
  providedIn: 'root',
})
export class GeneriServices {
  private url = 'http://localhost:9090/rest/genere';

  generi = signal<Genere[]>([]);

  constructor(private http: HttpClient) {}

  list(): Observable<Genere[]> {
    return this.http.get<Genere[]>(`${this.url}/list`);
  }

  findById(id: number): Observable<Genere> {
    return this.http.get<Genere>(`${this.url}/findById`, { params: { id } });
  }

  create(genere: Omit<Genere, 'id'>): Observable<any> {
    return this.http.post(`${this.url}/create`, genere);
  }

  update(genere: Genere): Observable<any> {
    return this.http.put(`${this.url}/update`, genere);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.url}/delete`, { params: { id } });
  }
}
