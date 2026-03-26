import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Genere, GeneriServices } from '../../../services/generi-services';
import { GenereDialog } from '../dialogs/genere-dialog/genere-dialog';


@Component({
  selector: 'app-gestione-generi',
  standalone: false,
  templateUrl: './gestione-generi.html',
  styleUrl: './gestione-generi.css'
})
export class GestioneGeneri implements OnInit {

  displayedColumns = ['id','descrizione'];
  dataSource = new MatTableDataSource<Genere>([]);

  filters = { descrizione: '' };

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private generiService: GeneriServices,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.caricaGeneri();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  caricaGeneri(): void {
    this.generiService.list().subscribe({
      next: (data) => {
        this.dataSource.data = data;
        this.cdr.detectChanges();
      },
      error: () => this.showSnack('Errore nel caricamento dei generi', true)
    });
  }

  onFilterChange(): void {

  }

  resetFilters(): void {
    this.filters = { descrizione: '' };
    this.dataSource.filter = '';
  }

  openCreateDialog(): void {
    const ref = this.dialog.open(GenereDialog, { data: null });
    ref.afterClosed().subscribe(result => {
      if (!result || result.action !== 'save') return;
      this.generiService.create(result).subscribe({
        next: (res: any) => {
          this.showSnack(res.msg, false);
          this.caricaGeneri();
        },
        error: (err: any) => this.showSnack(err.error?.msg || 'Errore', true)
      });
    });
  }

  edit(genere: Genere): void {
    const ref = this.dialog.open(GenereDialog, { data: { ...genere } });
    ref.afterClosed().subscribe(result => {
      if (!result) return;

      if (result.action === 'save') {
        this.generiService.update({ id: genere.id, ...result }).subscribe({
          next: (res: any) => {
            this.showSnack(res.msg, false);
            this.caricaGeneri();
          },
          error: (err: any) => this.showSnack(err.error?.msg || 'Errore', true)
        });
      }

      if (result.action === 'delete') {
        this.generiService.delete(result.id).subscribe({
          next: (res: any) => {
            this.showSnack(res.msg, false);
            this.caricaGeneri();
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