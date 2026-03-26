import { Component, OnInit, ViewChild } from '@angular/core';
import { GestionePagamentiService } from '../../../services/gestione-pagamenti-service';
import { MatTableDataSource } from '@angular/material/table';
import { TipoPagamento } from '../../../models/tipo-pagamento.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { TipoPagamentoDialog } from '../../dialog/tipo-pagamento-dialog/tipo-pagamento-dialog';
import { MatPaginator } from '@angular/material/paginator';

@Component({
  selector: 'app-gestione-pagamenti',
  standalone: false,
  templateUrl: './gestione-pagamenti.html',
  styleUrl: './gestione-pagamenti.css',
})
export class GestionePagamenti implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  displayedColumns: string[] = ['id', 'tipoPagamento'];
  dataSource = new MatTableDataSource<TipoPagamento>();

  constructor(
    private gestionePagamentiService: GestionePagamentiService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ){}

  form!: FormGroup;
  loading = false;
  tipoPagamentoInModifica: TipoPagamento | null = null;

  ngOnInit(): void {
    this.initForm();
    this.loadData();
  }

  initForm(){
    this.form = this.fb.group({
      id: ['', [Validators.required]],
      tipoPagamento: ['', [Validators.required]]
    });
  }

  loadData(){
    this.loading = true;
    this.gestionePagamentiService.list().subscribe({
      next: (data: TipoPagamento[]) => {
        this.dataSource.data = data;
        this.loading = false;
      },
      error: () => {
        this.showMsg('Errore caricamento dati', true);
        this.loading = false;
      }
    });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  openCreateDialog() {
    const dialogRef = this.dialog.open(TipoPagamentoDialog, {
      width: '400px',
      data: null
    });

    dialogRef.afterClosed().subscribe(result => {
      if(!result) return;

      this.gestionePagamentiService.create(result).subscribe({
        next: (res: any) => {
          this.showMsg(res.msg, false);
          this.reset();
          this.loadData();
        },
        error: (err) => {
          this.showMsg(err.error?.msg, true);
        }
      });
    });
  }

  edit(tipoPagamento: TipoPagamento) {
    const dialogRef = this.dialog.open(TipoPagamentoDialog, {
      width: '400px',
      data: tipoPagamento
    });

    dialogRef.afterClosed().subscribe(result => {
      if(!result) return;
      if(result.action === 'delete') {
        this.gestionePagamentiService.delete(result.id).subscribe({
          next: (res: any) => this.showMsg(res.msg, false),
          error: (err) => this.showMsg(err.error?.msg, true),
          complete: () => this.loadData()
        });
      }
      if(result.action === 'save') {
        this.gestionePagamentiService.update({
          id: tipoPagamento.id,
          ...result
        }).subscribe({
          next: (res: any) => {
            this.showMsg(res.msg, false);
            this.loadData();
          },
          error: (err) => {
            this.showMsg(err.error?.msg, true);
          },
          complete: () => this.loadData()
        });
      }
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  reset(){
    this.form.reset();
    this.tipoPagamentoInModifica = null;
  }

  showMsg(msg: string, isError: boolean){
    this.snackBar.open(msg, 'OK', {
      duration: 3000,
      panelClass: isError ? 'snack-error' : 'snack-success'
    });
  }
}
