import { Injectable, signal } from '@angular/core';
import { StatoOrdine } from '../models/stato-ordine';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class StatoOrdineServices {

  private url = "http://localhost:9090/rest/stato_ordine/";

  spedizioni = signal<StatoOrdine[]>([]);

  constructor(private http: HttpClient) {}

  list(): Observable<StatoOrdine[]> {
  return this.http.get<StatoOrdine[]>(this.url + "list");
}
  findById(id: number): Observable<StatoOrdine[]> {
    return this.http.get<StatoOrdine[]>(this.url + "findById/" + id);
}

  create(spedizione: Omit<StatoOrdine, 'id'>) {
    return this.http.post(this.url + "create", spedizione);
  }

  update(spedizione: StatoOrdine) {
    return this.http.put(this.url + "update", spedizione);
  }

  delete(id: number) {
    return this.http.delete(this.url + "delete/" + id);
  }

}
