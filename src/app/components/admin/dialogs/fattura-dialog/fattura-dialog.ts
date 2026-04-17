import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SpedizioneServices } from '../../../../services/spedizioni-services';
import { GestionePagamentiService } from '../../../../services/gestione-pagamenti-service';
import { FattureServices } from '../../../../services/fatture-services';
import { StatoOrdine } from '../../../../models/stato-ordine';
import { catchError, map, of } from 'rxjs';

@Component({
  selector: 'app-fattura-dialog',
  standalone: false,
  templateUrl: './fattura-dialog.html',
  styleUrl: './fattura-dialog.css',
})
export class FatturaDialog implements OnInit {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<FatturaDialog>);
  private fattureServices = inject(FattureServices);
  private spedizioneServices = inject(SpedizioneServices);
  private pagamentoServices = inject(GestionePagamentiService);
  data: any = inject(MAT_DIALOG_DATA);

  form!: FormGroup;
  tipoPagamentoList: any[] = [];
  tipoSpedizioneList: any[] = [];

  isEditMode: boolean = !!this.data;
  allowedStates = signal<string[]>([]);
  selectedStato = signal<string>(this.data?.statoFattura ?? '');

  ngOnInit(): void {
    this.buildForm();
    this.loadDropdowns();

    if (this.isEditMode) {
      this.patchForm();
      this.disableAllExceptStato();
      this.loadAllowedStates();
    }
  }

  private buildForm(): void {
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

  private patchForm(): void {
    this.form.patchValue({
      ...this.data,
      dataEmissione: this.data.dataEmissione
        ? new Date(this.data.dataEmissione)
        : new Date()
    });
  }

  private disableAllExceptStato(): void {
    // Disable every control — the stato select is outside the form so it stays interactive
    Object.keys(this.form.controls).forEach((key: string) => {
      this.form.get(key)?.disable();
    });
  }

  private loadAllowedStates(): void {
    this.fattureServices.getNextAllowedStates(this.data.id).pipe(
      map((stati: StatoOrdine[]): string[] => stati.map(s => s.statoOrdine)),
      catchError(() => of([] as string[]))
    ).subscribe((states: string[]) => {
      this.allowedStates.set(states);
    });
  }

  private loadDropdowns(): void {
    this.pagamentoServices.list().subscribe((data: any[]) => {
      this.tipoPagamentoList = data;
      if (this.data?.tipoPagamento) {
        const pag = data.find(p => p.tipoPagamento === this.data.tipoPagamento);
        if (pag) this.form.patchValue({ tipoPagamentoId: pag.id });
      }
    });

    this.spedizioneServices.list().subscribe((data: any[]) => {
      this.tipoSpedizioneList = data;
      if (this.data?.tipoSpedizione) {
        const spe = data.find(s => s.tipoSpedizione === this.data.tipoSpedizione);
        if (spe) this.form.patchValue({ tipoSpedizioneId: spe.id });
      }
      // Auto-fill costo spedizione when type changes (only relevant in create mode)
      this.form.get('tipoSpedizioneId')?.valueChanges.subscribe(idSelezionato => {
        const spedizione = this.tipoSpedizioneList.find(s => s.id === idSelezionato);
        if (spedizione) {
          this.form.patchValue(
            { costoSpedizione: spedizione.costoSpedizione },
            { emitEvent: false }
          );
        }
      });
    });
  }

  onStatoChange(nuovoStato: string): void {
    this.selectedStato.set(nuovoStato);
  }

  save(): void {
    if (this.isEditMode) {
      // Edit mode: only stato change is allowed
      const nuovoStato: string = this.selectedStato();
      if (nuovoStato && nuovoStato !== this.data.statoFattura) {
        this.dialogRef.close({ action: 'changeStato', stato: nuovoStato, fatturaId: this.data.id });
      } else {
        this.dialogRef.close();
      }
      return;
    }

    // Create mode: full payload
    if (this.form.invalid) return;

    const formValue = this.form.getRawValue();
    const dataFormattata: string = new Date(formValue.dataEmissione).toISOString().split('T')[0];

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

  close(): void { this.dialogRef.close(); }
}