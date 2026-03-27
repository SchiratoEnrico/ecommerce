import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RigaOrdineServices } from '../../../../services/riga-ordine-services';
import { RigaOrdine } from '../../../../models/riga-ordine.model';
import { Ordine } from '../../../../models/ordine.model';
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
    private rigaOrdineServices: RigaOrdineServices,
    private snack: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.form = fb.group({
      account: [null, Validators.required],
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
      this.loadRighe();
    }
  }

    loadRighe() {
      this.rigaOrdineServices.list(this.data.id).subscribe({
        next: (righe) => this.righeOrdine = righe,
        error: (err) => this.showMsg('Errore caricamento righe ordine', true)
    });
  }

  openRigaDialog(riga?: RigaOrdine) {
    const dialogRef = this.dialog.open(RigaOrdineDialog, {
      width: '500px',
      data: { riga: riga ?? null, idOrdine: this.data.id }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result) return;

      if (result.action === 'delete') {
        this.rigaOrdineServices.delete(result.id).subscribe({
          next: (res: any) => this.showMsg(res.msg, false),
          error: (err) => this.showMsg(err.error?.msg, true),

        });
      }

      if (result.action === 'save'){
        const call = riga
          ? this.rigaOrdineServices.update({ id: riga.id, ...result })
          : this.rigaOrdineServices.create(result);

          call.subscribe({
            next: (res: any) => this.showMsg(res.msg, false),
            error: (err) => this.showMsg(err.error?.msg, true)

          });
      }
    });
  }


  delete() {
    if (!confirm('Confermi eliminazione?')) return;
    this.dialogRef.close({ action: 'delete', id: this.data.id });
  }

  save() {
    if (this.form.invalid) return;
    const { usernameDispaly, ...body} = this.form.value;
    this.dialogRef.close({ action: 'save', ...body });
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
