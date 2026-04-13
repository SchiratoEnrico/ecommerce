import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { RigaOrdine } from '../../../../models/riga-ordine';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RigaOrdineDialog } from '../riga-ordine-dialog/riga-ordine-dialog';
import { OrdiniServices } from '../../../../services/ordini-services';
import { SpedizioneServices } from '../../../../services/spedizioni-services';
import { StatoOrdineServices } from '../../../../services/stato-ordine-services';
import { GestionePagamentiService } from '../../../../services/gestione-pagamenti-service';

@Component({
  selector: 'app-ordine-dialog',
  standalone: false,
  templateUrl: './ordine-dialog.html',
  styleUrl: './ordine-dialog.css',
})
export class OrdineDialog implements OnInit{
  form: any;
  righeOrdine: RigaOrdine[] = [];
  statoOrdine: string[] = [];
  tipoPagamento: string[] = [];
  tipoSpedizione: string[] = [];  

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<OrdineDialog>,
    private dialog: MatDialog,
    private snack: MatSnackBar,
    private cdr: ChangeDetectorRef,
    private ordiniService: OrdiniServices,
    private spedizioneServices: SpedizioneServices, 
    private statoServices: StatoOrdineServices,        
    private pagamentoServices: GestionePagamentiService, 
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.form = fb.group({
      account: [null],
      username: ['', Validators.required],
      stato: ['', Validators.required],
      tipoPagamento: ['', Validators.required],
      tipoSpedizione: ['', Validators.required],
      data: ['', Validators.required],
    });

    if (data) {
      this.form.patchValue({
        account: data.account?.id ?? null,
        username: data.account?.username ?? '',
        stato: data.stato?.statoOrdine ?? '',
        tipoPagamento: data.pagamento?.tipoPagamento ?? '',
        tipoSpedizione: data.spedizione?.tipoSpedizione ?? '',
        data: data.data ?? '',
      }); 
    }
  }

  ngOnInit(): void {
    this.statoServices.list().subscribe((data: any[]) => {
    this.statoOrdine = data.map((s: any) => s.statoOrdine);
  });
    this.pagamentoServices.list().subscribe((data: any[]) => {
    this.tipoPagamento = data.map((p: any) => p.tipoPagamento);
  });
  this.spedizioneServices.list().subscribe((data: any[]) => {
    this.tipoSpedizione = data.map((s: any) => s.tipoSpedizione);
  });

  }

  addRigaLocale() {
  const dialogRef = this.dialog.open(RigaOrdineDialog, {
    width: '500px',
    data: { riga: null, idOrdine: null }
  });

  dialogRef.afterClosed().subscribe(result => {
    console.log('result dalla RigaOrdineDialog:', result);
    if (!result || result.action !== 'save') return;
    this.righeOrdine = [...this.righeOrdine, {
      manga: result.manga,
      numeroCopie: result.numeroCopie
    } as RigaOrdine];
    this.cdr.detectChanges();
  });
}
  removeRiga(index: number) {
    if (this.data) return;
    this.righeOrdine = this.righeOrdine.filter((_, i) => i !== index);
  }

 save() {
  if (this.form.invalid) return;
    const { username, ...body } = this.form.value;
    this.dialogRef.close({
      action: 'save',
      username, 
      ...body,
      righe: this.data ? undefined : this.righeOrdine
    });
  }

  delete() {
    if (!confirm('Confermi eliminazione?')) return;
    this.dialogRef.close({ action: 'delete', id: this.data.id });
  }

  close() {
    this.dialogRef.close();
  }

  showMsg(msg: string, isError: boolean) {
    this.snack.open(msg, 'OK', {
      duration: 3000,
      panelClass: isError ? 'snack-error' : 'snack-success'
    });
  }
}
