import { Component, Inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-riga-ordine-dialog',
  standalone: false,
  templateUrl: './riga-ordine-dialog.html',
  styleUrl: './riga-ordine-dialog.css',
})
export class RigaOrdineDialog {

  form: any;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<RigaOrdineDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.form = fb.group({
      manga: ['', Validators.required],
      numeroCopie: [1, [Validators.required, Validators.min(1)]],
    });

    if (data?.riga) {
      this.form.patchValue({
        manga: data.riga.manga ?? '',
        numeroCopie: data.riga.numeroCopie ?? 1,
      });
    }
  }
  delete() {
    if (!confirm('Confermi eliminazione?')) return;
    this.dialogRef.close({ action: 'delete', id: this.data.riga.id });
  }

  save() {
    if (this.form.invalid) return;
    this.dialogRef.close({
      action: 'save',
      idOrdine: this.data.idOrdine,
      username: this.data.username,
      ...this.form.value
    
    });
  }

  close() {
    this.dialogRef.close();
  }

}
