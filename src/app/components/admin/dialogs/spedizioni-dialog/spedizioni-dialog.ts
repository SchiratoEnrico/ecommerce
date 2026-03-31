import { Component, Inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-spedizioni-dialog',
  standalone: false,
  templateUrl: './spedizioni-dialog.html',
  styleUrl: './spedizioni-dialog.css',
})
export class SpedizioniDialog {

  form:any;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<SpedizioniDialog>,  
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {

    this.form = this.fb.group({
      tipoSpedizione: ['', Validators.required]
    });

    if (data) {
      this.form.patchValue(data);
    }
  }

  delete() {
    if (!confirm('Confermi eliminazione?')) return;
    this.dialogRef.close({ action: 'delete', id: this.data.id });
  }

  save() {
    if (this.form.invalid) return;
    this.dialogRef.close({ action: 'save', ...this.form.value });
  }

  close() {
    this.dialogRef.close();
  }

}
