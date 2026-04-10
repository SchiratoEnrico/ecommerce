import { ChangeDetectorRef, Component, computed, Inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RigaFattura } from '../../../../models/riga-fattura';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { RigaFatturaDialog } from '../riga-fattura-dialog/riga-fattura-dialog';
import { SpedizioneServices } from '../../../../services/spedizioni-services';
import { GestionePagamentiService } from '../../../../services/gestione-pagamenti-service';

@Component({
  selector: 'app-fattura-dialog',
  standalone: false,
  templateUrl: './fattura-dialog.html',
  styleUrl: './fattura-dialog.css',
})
export class FatturaDialog implements OnInit {
form: FormGroup;
  righe = signal<RigaFattura[]>([]);
  tipoPagamentoList: any[] = [];
  tipoSpedizioneList: any[] = [];

  totaleRighe = computed(() =>
    this.righe().reduce((t, r) => t + (r.totaleRiga ?? 0), 0)
  );

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef,
    private dialogRef: MatDialogRef<FatturaDialog>,
    private spedizioneServices: SpedizioneServices,
    private pagamentoServices: GestionePagamentiService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    // In modalità creazione (data == null) ordineId è obbligatorio
    this.form = this.fb.group({
      numeroFattura:    [''],
      dataEmissione:    [new Date(), Validators.required],
      ordineId:         ['', this.data == null ? [Validators.required, Validators.min(1)] : []],
      clienteNome:      ['', Validators.required],
      clienteCognome:   ['', Validators.required],
      clienteEmail:     ['', [Validators.required, Validators.email]],
      clienteIndirizzo: ['', Validators.required],
      clienteCitta:     ['', Validators.required],
      clienteCap:       ['', Validators.required],
      clienteProvincia: ['', Validators.required],
      clienteStato:     ['', Validators.required],
      tipoPagamentoId:  [null, Validators.required],
      tipoSpedizioneId: [null, Validators.required],
      costoSpedizione:  [0, Validators.min(0)],
      note:             ['']
    });
  }

  ngOnInit(): void {
    if (this.data) {
      this.form.patchValue({
        ...this.data,
        dataEmissione: this.data.dataEmissione
          ? new Date(this.data.dataEmissione)
          : new Date()
      });
      const righe = this.data.righeFattura ?? this.data.righe ?? [];
      console.log('righe caricate nel dialog:', righe); 
      this.righe.set(righe.map((r: RigaFattura) => ({ ...r })));
    }

    this.pagamentoServices.list().subscribe((data: any[]) => {
      this.tipoPagamentoList = data;
      if (this.data?.tipoPagamento) {
        const pag = data.find(p => p.tipoPagamento === this.data.tipoPagamento);
        if (pag) this.form.patchValue({ tipoPagamentoId: pag.id });
      }
      this.cdr.detectChanges();
    });

    this.spedizioneServices.list().subscribe((data: any[]) => {
      this.tipoSpedizioneList = data;
      if (this.data?.tipoSpedizione) {
        const spe = data.find(s => s.tipoSpedizione === this.data.tipoSpedizione);
        if (spe) this.form.patchValue({ tipoSpedizioneId: spe.id });
      }
      // Aggiorna costoSpedizione automaticamente al cambio selezione
      this.form.get('tipoSpedizioneId')?.valueChanges.subscribe(idSelezionato => {
        const spedizione = this.tipoSpedizioneList.find(s => s.id === idSelezionato);
        if (spedizione) {
          this.form.patchValue(
            { costoSpedizione: spedizione.costoSpedizione },
            { emitEvent: false }
          );
        }
      });
      this.cdr.detectChanges();
    });
  }

  addRigaLocale() {
    const ref = this.dialog.open(RigaFatturaDialog, {
      width: '400px',
      data: { riga: null }
    });
    ref.afterClosed().subscribe(result => {
      if (result?.action !== 'save') return;
 
      const nuova: RigaFattura = result.riga;
 
      this.righe.update(list => {
        const index = list.findIndex(r => r.isbn === nuova.isbn);
 
        if (index !== -1) {
          // ISBN già presente -> somma le copie e ricalcola il totale
          return list.map((r, i) => {
            if (i !== index) return r;
            const copie = (r.numeroCopie ?? 1) + (nuova.numeroCopie ?? 1);
            return {
              ...r,
              numeroCopie: copie,
              totaleRiga: (r.prezzoUnitario ?? 0) * copie
            };
          });
        }
        return [...list, nuova]; // ISBN non presente -> aggiunge normalmente
      });
    });
  }

 editRiga(index: number) {
  const riga = this.righe()[index];
  const ref = this.dialog.open(RigaFatturaDialog, {
    width: '400px',
    data: { riga: { ...riga } }
  });
  ref.afterClosed().subscribe(result => {
    if (!result) return;

    if (result.action === 'save') {
      this.righe.update(list =>
        list.map((r, i) => i === index ? result.riga : r)
      );
    }

    if (result.action === 'delete') {
      this.righe.update(list => list.filter((_, i) => i !== index));
    }
  });
}

  removeRiga(index: number) {
    this.righe.update(list => list.filter((_, i) => i !== index));
  }

  save() {
    if (this.form.invalid) return;
    // In creazione le righe sono obbligatorie
    if (!this.data && this.righe().length === 0) return;

    const formValue = this.form.getRawValue();
    const dataFormattata = new Date(formValue.dataEmissione)
      .toISOString()
      .split('T')[0];

    const righeFatturaRequest = this.righe().map((r: RigaFattura) => ({
      id:              r.id ?? null,        
      isbn:            r.isbn,
      numeroCopie:     r.numeroCopie ?? 1,
      prezzoUnitario:  r.prezzoUnitario ?? null
    }));

    const payload = {
      clienteNome:           formValue.clienteNome,
      clienteCognome:        formValue.clienteCognome,
      clienteEmail:          formValue.clienteEmail,
      clienteIndirizzo:      formValue.clienteIndirizzo,
      clienteCitta:          formValue.clienteCitta,
      clienteCap:            formValue.clienteCap,
      clienteProvincia:      formValue.clienteProvincia,
      clienteStato:          formValue.clienteStato,
      tipoPagamentoId:       formValue.tipoPagamentoId,
      tipoSpedizioneId:      formValue.tipoSpedizioneId,
      costoSpedizione:       formValue.costoSpedizione || 0,
      dataEmissione:         dataFormattata,
      note:                  formValue.note || null,
      ordineId:              formValue.ordineId || null,
      totale:                this.totaleRighe() + (formValue.costoSpedizione || 0),
      righeFatturaRequest                     
    };

    this.dialogRef.close({
      action: 'save',
      payload,                               
      righeOriginali: this.data?.righeFattura ?? []
    });
  }

  delete() {
    if (confirm('Eliminare definitivamente questa fattura?')) {
      this.dialogRef.close({ action: 'delete' });
    }
  }

  close() { this.dialogRef.close(); }
}