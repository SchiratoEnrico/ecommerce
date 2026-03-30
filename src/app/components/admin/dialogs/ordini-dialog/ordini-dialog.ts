import { ChangeDetectorRef, Component, Inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RigaOrdine } from '../../../../models/riga-ordine.model';
import { RigaOrdineDialog } from '../riga-ordine-dialog/riga-ordine-dialog';

@Component({
  selector: 'app-ordini-dialog',
  standalone: false,
  templateUrl: './ordini-dialog.html',
  styleUrl: './ordini-dialog.css',
})

export class OrdiniDialog {

  form: any;
  righeOrdine: RigaOrdine[] = [];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<OrdiniDialog>,
    private dialog: MatDialog,
    private snack: MatSnackBar,
    private cdr: ChangeDetectorRef,
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