import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';

export interface Autore {
  id: number;
  nome: string;
  cognome: string;
  dataNascita: string;
  descrizione: string;
}

@Injectable({
  providedIn: 'root',
})
export class AutoriServices {
  private url = 'http://localhost:9090/rest/autore';

  autori = signal<Autore[]>([]);

  constructor(private http: HttpClient) {}

  list(): Observable<Autore[]> {
    return this.http.get<Autore[]>(`${this.url}/list`);
  }

  findById(id: number): Observable<Autore> {
    return this.http.get<Autore>(`${this.url}/findById`, { params: { id } });
  }

  create(autore: Omit<Autore, 'id'>): Observable<any> {
    return this.http.post(`${this.url}/create`, autore);
  }

  update(autore: Autore): Observable<any> {
    return this.http.put(`${this.url}/update`, autore);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.url}/delete`, { params: { id } });
  }
}