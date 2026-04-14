import { Component, OnInit, ChangeDetectorRef, Inject } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AnagraficaService } from '../../services/anagrafica-service';
import { GestionePagamentiService } from '../../services/gestione-pagamenti-service';
import { SpedizioneServices } from '../../services/spedizioni-services';
import { Anagrafica } from '../../models/anagrafica';
import { TipoPagamento } from '../../models/tipo-pagamento.model';
import { Spedizione } from '../../models/spedizione';


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

  anagrafiche: Anagrafica[] = [];
  tipiPagamento: TipoPagamento[] = [];
  tipiSpedizione: Spedizione[] = [];

  isLoading: boolean = true;

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: {idAccount:number},
    public dialogRef: MatDialogRef<CheckoutDialog>,
    private http: HttpClient,
    private router: Router,
    private anaS: AnagraficaService,
    private pagS: GestionePagamentiService,
    private speS: SpedizioneServices,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    await this.caricaDatiCheckout();
  }

  async caricaDatiCheckout() {
    this.isLoading = true;
    try {
      const [anagraficheRes, pagamentiRes, spedizioniRes] = await Promise.all([
        firstValueFrom(this.anaS.findByAccountId(this.data.idAccount)),
        firstValueFrom(this.pagS.list()),
        firstValueFrom(this.speS.list())
      ]);

      this.anagrafiche = anagraficheRes;
      this.tipiPagamento = pagamentiRes;
      this.tipiSpedizione = spedizioniRes;

      const indirizzoDefault = this.anagrafiche.find(a => a.predefinito === true);
      if (indirizzoDefault) {
        this.anagraficaId = indirizzoDefault.id;
      }

    } catch (error) {
      console.error("Errore nel recupero dei dati per il checkout:", error);
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges(); 
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
    this.dialogRef.close(); 
    this.router.navigate(['/profilo']); 
  }

  annulla() {
    this.dialogRef.close();
  }

  onAnagraficaChange(value: number) {
    if (value === -1) {
      this.anagraficaId = undefined as any; 
      
      this.vaiAlProfilo(); 
    }
  }
}