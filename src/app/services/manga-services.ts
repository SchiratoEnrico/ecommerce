import { Injectable, signal } from '@angular/core';
import { Manga } from '../models/manga';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, forkJoin, Observable, of } from 'rxjs';

export interface MangaFilters {
    titolo?: string;
    casaEditriceNome?: string;
    autoreNome?: string;
    autoreCognome?: string;
    sagaNome?: string;
    sagaId?: number | null;
    casaEditriceId?: number | null;
    autoreId?: number | null;
    generiId?: number[];
  };

@Injectable({
  providedIn: 'root',
})
export class MangaServices {
  private url = 'http://localhost:9090/rest/manga';
  constructor(private http:HttpClient) {}
  manga = signal<Manga[]>([]);
  
  listManga(filters?: MangaFilters): Observable<Manga[]> {
  let params = new HttpParams();
  if (filters) {
    if (filters.titolo)
      params = params.set('titolo', filters.titolo);
    if (filters.casaEditriceNome)
      params = params.set('casaEditriceNome', filters.casaEditriceNome);
    if (filters.autoreNome)
      params = params.set('autoreNome', filters.autoreNome);
    if (filters.sagaNome)
      params = params.set('sagaNome', filters.sagaNome);
    if (filters.autoreCognome)
      params = params.set('autoreCognome', filters.autoreCognome);
    if (filters.titolo)
      params = params.set('titolo', filters.titolo);
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
    return this.http.get<Manga[]>(`${this.url}/list`,  {params});
  }

  findMangaByIsbn(isbn: string): Observable<any> {
    return this.http.get<Manga>(`${this.url}/findByIsbn`, { params: { id: isbn } });
  }

  listAllByIsbns(isbns: string[]): Observable<(Manga | null)[]> {
    const requests: Observable<Manga | null>[] = isbns.map((isbn: string) =>
    this.findMangaByIsbn(isbn).pipe(
      catchError((err: any) => {
        console.error(`Errore caricamento manga ISBN ${isbn}:`, err);
        return of(null);
      })
    ));
    
  return forkJoin(requests);
  }

  create(manga: Omit<Manga, 'id'>): Observable<any> {
    return this.http.post(`${this.url}/create`, manga);
  }

  update(manga: Manga): Observable<any> {
    return this.http.put(this.url + "/update", manga);
  }

  delete(id: string): Observable<any> {
    return this.http.delete(`${this.url}/delete`, { params: { id: id.toString() } });
  }

  getAdvices(userId?: number): Observable<Manga[]> {
    let params = new HttpParams();
    if (userId) {
      params = params.set('accountId', userId);
    }
    return this.http.get<Manga[]>(`${this.url}/advices`, { params });
  }

  getBestSellers(): Observable<Manga[]> {
    return this.http.get<Manga[]>(`${this.url}/bestSellers`);
  }

  getLatestArrives(): Observable<Manga[]> {
    return this.http.get<Manga[]>(`${this.url}/latestArrives`);
  }
}
