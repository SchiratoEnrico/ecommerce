import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { SpedizioneServices } from '../../../../services/spedizioni-services';
import { GestionePagamentiService } from '../../../../services/gestione-pagamenti-service';
import { FattureServices } from '../../../../services/fatture-services';

@Component({
  selector: 'app-fattura-dialog',
  standalone: false,
  templateUrl: './fattura-dialog.html',
  styleUrl: './fattura-dialog.css',
})
export class FatturaDialog implements OnInit {
form: FormGroup;
  tipoPagamentoList: any[] = [];
  tipoSpedizioneList: any[] = [];

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef,
    private dialogRef: MatDialogRef<FatturaDialog>,
    private fattureServices: FattureServices,
    private spedizioneServices: SpedizioneServices,
    private pagamentoServices: GestionePagamentiService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
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

  save() {
    if (this.form.invalid) return;

    const formValue = this.form.getRawValue();
    const dataFormattata = new Date(formValue.dataEmissione).toISOString().split('T')[0];

    const payload = {
      clienteNome:      formValue.clienteNome,
      clienteCognome:   formValue.clienteCognome,
      clienteEmail:     formValue.clienteEmail,
      clienteIndirizzo: formValue.clienteIndirizzo,
      clienteCitta:     formValue.clienteCitta,
      clienteCap:       formValue.clienteCap,
      clienteProvincia: formValue.clienteProvincia,
      clienteStato:     formValue.clienteStato,
      tipoPagamentoId:  formValue.tipoPagamentoId,
      tipoSpedizioneId: formValue.tipoSpedizioneId,
      costoSpedizione:  formValue.costoSpedizione || 0,
      dataEmissione:    dataFormattata,
      note:             formValue.note || null,
      ordineId:         formValue.ordineId || null,
    };

    this.dialogRef.close({ action: 'save', payload });
  }

  delete() {
    if (confirm('Eliminare definitivamente questa fattura?')) {
      this.dialogRef.close({ action: 'delete' });
    }
  }

  close() { this.dialogRef.close(); }
}