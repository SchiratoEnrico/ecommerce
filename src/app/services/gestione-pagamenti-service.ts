import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { tap } from 'rxjs';

interface Pagamento {
  id: number;
  tipo_pagamento: string;
}

interface PagamentoPayload {
  id?: number;
  tipo_pagamento: string;
}

@Injectable({
  providedIn: 'root',
})
export class GestionePagamentiService {
  url = 'http://localhost:9090/rest/tipo_pagamento';

  pagamenti = signal<Pagamento[]>([]);
  constructor(private http: HttpClient) {}

  list() {
    this.http.get<any[]>(this.url + '/list').subscribe({
      next: (resp) => {
        const normalized = (resp ?? []).map((item) => ({
          id: item.id,
          tipo_pagamento:
            item.tipo_pagamento ?? item.tipoPagamento ?? item.tipi_pagamento ?? '',
        }));
        this.pagamenti.set(normalized);
      },
    });
  }

  findById(id: number) {
    let params = new HttpParams().set('id', id);
    return this.http.get<any>(this.url + '/findById', { params });
  }

  create(body: PagamentoPayload) {
    const requestBody = this.toBackendPayload(body);
    return this.http.post(this.url + '/create', requestBody)
      .pipe(tap(() => this.list()));
  }

  update(body: PagamentoPayload) {
    const requestBody = this.toBackendPayload(body);
    return this.http.put(this.url + '/update', requestBody)
      .pipe(tap(() => this.list()));
  }

  delete(id: number) {
    return this.http.delete(this.url + '/delete/' + id)
      .pipe(tap(() => this.list()));
  }

  private toBackendPayload(body: PagamentoPayload) {
    const value = body.tipo_pagamento?.trim();
    return {
      ...(body.id !== undefined ? { id: body.id } : {}),
      tipo_pagamento: value,
      tipoPagamento: value,
      tipi_pagamento: value,
    };
  }
}
