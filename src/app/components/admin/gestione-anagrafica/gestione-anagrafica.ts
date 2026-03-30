import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AnagraficaService } from '../../../services/anagrafica-service';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Anagrafica } from '../../../models/anagrafica';
import { AnagraficaDialog } from '../dialogs/anagrafica-dialog/anagrafica-dialog';

@Component({
  selector: 'app-anagrafica',
  standalone: false,
  templateUrl: './gestione-anagrafica.html',
  styleUrl: './gestione-anagrafica.css',
})
export class GestioneAnagrafica implements OnInit {
   displayedColumns = ['id', 'nominativo', 'indirizzo', 'stato', 'predefinito'];
  dataSource = new MatTableDataSource<Anagrafica>([]);
 
  filters = { nome: '', cognome: '' };
  accountId: number | null = null;
  username: string | null = null;
 
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
 
  constructor(
    private route: ActivatedRoute,
    private anagraficaService: AnagraficaService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef,
  ) {}
 
  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      if (params['id']) {
        this.accountId = + params['id'];
        this.username = params['username'];
        this.caricaPerAccount(this.accountId);
      } else {
        this.caricaTutte();
      }
    });
  }
 
  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
 
  caricaPerAccount(accountId: number): void {
    this.anagraficaService.findByAccountId(accountId).subscribe({
      next: (data) => {
        this.dataSource.data = data;
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        console.error(error);
        this.showSnack('Errore nel caricamento', true);
      }
    });
  }
 
  caricaTutte(): void {
    this.anagraficaService.list().subscribe({
      next: (data) => {
        this.dataSource.data = data;
        this.cdr.detectChanges();
      },
      error: () => this.showSnack('Errore nel caricamento', true),
    });
  }
 
  onFilterChange(): void {

  }
 
  resetFilters(): void {
    this.filters = { nome: '', cognome: '' };
    this.dataSource.filter = '';
  }
 
  openCreateDialog(): void {
    const ref = this.dialog.open(AnagraficaDialog, {
      data: { anagrafica: null, accountId: this.accountId }
    });
    ref.afterClosed().subscribe(result => {
      if (!result || result.action !== 'save') return;
      this.anagraficaService.create(result.payload).subscribe({
        next: (res: any) => {
          this.showSnack(res.msg, false);
          this.accountId ? this.caricaPerAccount(this.accountId) : this.caricaTutte();
        },
        error: (err: any) => this.showSnack(err.error?.msg || 'Errore', true)
      });
    });
  }
 
  edit(anagrafica: Anagrafica): void {
    const ref = this.dialog.open(AnagraficaDialog, {
      data: { anagrafica: { ...anagrafica }, accountId: this.accountId }
    });
    ref.afterClosed().subscribe(result => {
      if (!result) return;
 
      if (result.action === 'save') {
        this.anagraficaService.update({ id: anagrafica.id, ...result.payload }).subscribe({
          next: (res: any) => {
            this.showSnack(res.msg, false);
            this.accountId ? this.caricaPerAccount(this.accountId) : this.caricaTutte();
          },
          error: (err: any) => this.showSnack(err.error?.msg || 'Errore', true)
        });
      }
 
      if (result.action === 'delete') {
        this.anagraficaService.delete(anagrafica.id).subscribe({
          next: (res: any) => {
            this.showSnack(res.msg, false);
            this.accountId ? this.caricaPerAccount(this.accountId) : this.caricaTutte();
          },
          error: (err: any) => this.showSnack(err.error?.msg || 'Errore', true)
        });
      }
    });
  }
 
  private showSnack(msg: string, isError: boolean): void {
    this.snackBar.open(msg, '✕', {
      duration: 4000,
      panelClass: isError ? ['snack-error'] : ['snack-success'],
    });
  }
}
