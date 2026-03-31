import { Component, Inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-genere-dialog',
  standalone: false,
  templateUrl: './genere-dialog.html',
  styleUrl: './genere-dialog.css',
})
export class GenereDialog {
  form: any;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<GenereDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.form = fb.group({
      descrizione: ['', Validators.required],
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