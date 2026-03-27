import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AutoriServices } from '../../../services/autori-services';
import { AutoreDialog } from '../dialogs/autore-dialog/autore-dialog';
import { Autore } from '../../../models/autore';


@Component({
  selector: 'app-gestione-autori',
  standalone: false,
  templateUrl: './gestione-autori.html',
  styleUrl: './gestione-autori.css'
})
export class GestioneAutori implements OnInit {

  displayedColumns = ['id', 'nome', 'cognome', 'dataNascita', 'descrizione'];
  dataSource = new MatTableDataSource<Autore>([]);

  filters = { nome: '', cognome: '' };

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private autoriService: AutoriServices,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.caricaAutori();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  caricaAutori(): void {
    this.autoriService.list().subscribe({
      next: (data) => {
        this.dataSource.data = data;
        this.cdr.detectChanges();
      },
      error: () => this.showSnack('Errore nel caricamento degli autori', true)
    });
  }

  onFilterChange(): void {

  }

  resetFilters(): void {
    this.filters = { nome: '', cognome: '' };
    this.dataSource.filter = '';
  }

  openCreateDialog(): void {
    const ref = this.dialog.open(AutoreDialog, { data: null });
    ref.afterClosed().subscribe(result => {
      if (!result || result.action !== 'save') return;
      this.autoriService.create(result).subscribe({
        next: (res: any) => {
          this.showSnack(res.msg, false);
          this.caricaAutori();
        },
        error: (err: any) => this.showSnack(err.error?.msg || 'Errore', true)
      });
    });
  }

  edit(autore: Autore): void {
    const ref = this.dialog.open(AutoreDialog, { data: { ...autore } });
    ref.afterClosed().subscribe(result => {
      if (!result) return;

      if (result.action === 'save') {
        this.autoriService.update({ id: autore.id, ...result }).subscribe({
          next: (res: any) => {
            this.showSnack(res.msg, false);
            this.caricaAutori();
          },
          error: (err: any) => this.showSnack(err.error?.msg || 'Errore', true)
        });
      }

      if (result.action === 'delete') {
        this.autoriService.delete(result.id).subscribe({
          next: (res: any) => {
            this.showSnack(res.msg, false);
            this.caricaAutori();
          },
          error: (err: any) => this.showSnack(err.error?.msg || 'Errore', true)
        });
      }
    });
  }

  private showSnack(msg: string, isError: boolean): void {
    this.snackBar.open(msg, '✕', {
      duration: 4000,
      panelClass: isError ? ['snack-error'] : ['snack-success']
    });
  }
}