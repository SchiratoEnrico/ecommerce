import { Component, Inject } from '@angular/core';
import { AbstractControl, FormBuilder, ValidationErrors, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-account-dialog',
  standalone: false,
  templateUrl: './account-dialog.html',
  styleUrl: './account-dialog.css',
})
export class AccountDialog {
  form: any;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AccountDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.form = fb.group({
      username:        ['', Validators.required],
      email:     ['', Validators.required],
      ruolo:     ['', Validators.required],
      password: ['', Validators.required],
      password2: ['', Validators.required],
    }, { validators: passwordMatchValidator });

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
     const { password2, ...payload } = this.form.value;
    this.dialogRef.close({ action: 'save', ...payload });
  }

  close() {
    this.dialogRef.close();
  }
}

function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password  = control.get('password')?.value;
  const password2 = control.get('password2')?.value;
  return password === password2 ? null : { passwordMismatch: true };
}
