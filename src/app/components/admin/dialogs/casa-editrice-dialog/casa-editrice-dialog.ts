import { Component, Inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-casa-editrice-dialog',
  standalone: false,
  templateUrl: './casa-editrice-dialog.html',
  styleUrl: './casa-editrice-dialog.css',
})
export class CasaEditriceDialog {
  form: any;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CasaEditriceDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.form = fb.group({
      nome: ['', Validators.required],
      descrizione: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      indirizzo: ['', Validators.required],
      //isbns: [[], [Validators.required]]
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
