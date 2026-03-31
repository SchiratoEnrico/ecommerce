import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, tap } from 'rxjs';
import { TipoPagamento } from '../models/tipo-pagamento.model';

interface PagamentoPayload {
  id?: number;
  tipoPagamento: string;
}

@Injectable({
  providedIn: 'root',
})
export class GestionePagamentiService {
  url = 'http://localhost:9090/rest/tipo_pagamento/';

  pagamenti = signal<TipoPagamento[]>([]);
  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {}

  list(): Observable<TipoPagamento[]> {
    return this.http.get<TipoPagamento[]>(`${this.url}list`);
  }

  findById(id: number) {
    let params = new HttpParams().set('id', id);
    return this.http.get<any>(this.url + 'findById', { params });
  }

  create(body: PagamentoPayload) {
    const requestBody = this.toBackendPayload(body);
    return this.http.post(this.url + 'create', requestBody)
      .pipe(tap(() => this.list()));
  }

  update(body: PagamentoPayload) {
    const requestBody = this.toBackendPayload(body);
    return this.http.put(this.url + 'update', requestBody)
      .pipe(tap(() => this.list()));
  }

  delete(id: number) {
    return this.http.delete(this.url + 'delete/' + id)
      .pipe(tap(() => this.list()));
  }

  private toBackendPayload(body: PagamentoPayload) {
    const value = body.tipoPagamento?.trim();
    return {
      ...(body.id !== undefined ? { id: body.id } : {}),
      tipoPagamento: value,
    };
  }

  showMsg(msg: string, isError: boolean){
    this.snackBar.open(msg, 'OK', {
      duration: 3000,
      panelClass: isError ? 'snack-error' : 'snack-success'
    });
  }
}
