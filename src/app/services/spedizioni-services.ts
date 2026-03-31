import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Spedizione } from '../models/spedizione';

@Injectable({
  providedIn: 'root',
})

export class SpedizioneServices {

  private url = "http://localhost:9090/rest/tipo_spedizione/";

  spedizioni = signal<Spedizione[]>([]);

  constructor(private http: HttpClient) {}


  list(): Observable<Spedizione[]> {
  return this.http.get<Spedizione[]>(this.url + "list");
}
/*
findById(id: number): Observable<Spedizione[]> {
  return this.http.get<Spedizione[]>(this.url + "findById/" + id);
}
*/

  create(spedizione: Omit<Spedizione, 'id'>) {
    return this.http.post(this.url + "create", spedizione);
  }

  update(spedizione: Spedizione) {
    return this.http.put(this.url + "update", spedizione);
  }

  delete(id: number) {
    return this.http.delete(this.url + "delete/" + id);
  }

}
