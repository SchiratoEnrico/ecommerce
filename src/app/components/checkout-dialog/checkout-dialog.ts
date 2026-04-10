import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-checkout-dialog',
  standalone: false,
  templateUrl: './checkout-dialog.html',
  styleUrl: './checkout-dialog.css'
})
export class CheckoutDialog implements OnInit {
  anagraficaId!: number;
  tipoPagamentoId!: number;
  tipoSpedizioneId!: number;

  anagrafiche: any[] = [];
  tipiPagamento: any[] = [];
  tipiSpedizione: any[] = [];

  // Variabile per mostrare un loader mentre scarichiamo i dati dal DB
  isLoading: boolean = true;

  constructor(
    public dialogRef: MatDialogRef<CheckoutDialog>,
    private http: HttpClient,
    private router: Router
  ) {}

  async ngOnInit() {
    await this.caricaDatiCheckout();
  }

  async caricaDatiCheckout() {
    this.isLoading = true;
    try {
      // Eseguiamo le 3 chiamate in parallelo per non far aspettare l'utente
      const [anagraficheRes, pagamentiRes, spedizioniRes] = await Promise.all([
        firstValueFrom(this.http.get<any[]>('http://localhost:9090/rest/anagrafica/list')),
        firstValueFrom(this.http.get<any[]>('http://localhost:9090/rest/tipo_pagamento/list')),
        firstValueFrom(this.http.get<any[]>('http://localhost:9090/rest/tipo_spedizione/list'))
      ]);

      this.anagrafiche = anagraficheRes;
      this.tipiPagamento = pagamentiRes;
      this.tipiSpedizione = spedizioniRes;

      // UX Boost: Se c'è un indirizzo predefinito, selezionalo in automatico!
      const indirizzoDefault = this.anagrafiche.find(a => a.predefinito === true);
      if (indirizzoDefault) {
        this.anagraficaId = indirizzoDefault.id;
      }

    } catch (error) {
      console.error("Errore nel recupero dei dati per il checkout:", error);
    } finally {
      this.isLoading = false;
    }
  }

  get isFormValido(): boolean {
    return !!(this.anagraficaId && this.tipoPagamentoId && this.tipoSpedizioneId);
  }

  confermaDati() {
    if (this.isFormValido) {
      this.dialogRef.close({
        anagraficaId: this.anagraficaId,
        tipoPagamentoId: this.tipoPagamentoId,
        tipoSpedizioneId: this.tipoSpedizioneId
      });
    }
  }

  vaiAlProfilo() {
    this.dialogRef.close(); // Chiudiamo il dialog
    this.router.navigate(['/profilo']); // Navighiamo al profilo per fargli creare l'indirizzo
  }

  annulla() {
    this.dialogRef.close();
  }
}