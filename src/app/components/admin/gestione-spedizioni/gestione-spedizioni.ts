import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { SpedizioneServices } from '../../../services/spedizioni-services';
import { Spedizione } from '../../../models/spedizione';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SpedizioniDialog } from '../dialogs/spedizioni-dialog/spedizioni-dialog';
import { MatPaginator } from '@angular/material/paginator';



@Component({
  selector: 'app-gestione-spedizioni',
  standalone: false,
  templateUrl: './gestione-spedizioni.html',
  styleUrl: './gestione-spedizioni.css',
})

export class GestioneSpedizioni implements OnInit {

   @ViewChild(MatPaginator) paginator!: MatPaginator;
  displayedColumns: string[] = ['id', 'tipoSpedizione'];
  dataSource = new MatTableDataSource<Spedizione>();

  constructor(
    private spedizioniService: SpedizioneServices,
    private snack: MatSnackBar, 
    private dialog:  MatDialog,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadData();
  }
  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  loadData() {
    this.spedizioniService.list().subscribe({
      next: (data) => {
        this.dataSource.data = data;
        setTimeout(() => this.cdr.detectChanges()); 
      },
      error: () => this.showMsg('Errore nel caricamento delle spedizioni', true)
    });
  }

  openCreateDialog() {
    const dialogRef = this.dialog.open(SpedizioniDialog, {
      width: '400px',
      data: null
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (!result) return;
      this.spedizioniService.create(result).subscribe({
        next: (res: any) => {
          this.showMsg(res.msg, false);
          this.loadData();
        },
        error: (err) => this.showMsg(err.error?.msg, true)
      });
    });
  }
  modificaSpedizione(spedizione: Spedizione): void {
    const dialogRef = this.dialog.open(SpedizioniDialog, {
      width: '400px',
      data: spedizione
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (!result) return;

      if (result.action === 'delete') {
        this.spedizioniService.delete(result.id).subscribe({
          next: (res: any) => this.showMsg(res.msg, false),
          error: (err) => this.showMsg(err.error?.msg, true),
          complete: () => this.loadData()
        });
      }

      if (result.action === 'save') {
        this.spedizioniService.update({
          id: spedizione.id,
          ...result
        }).subscribe({
          next: (res: any) => {
            this.showMsg(res.msg, false);
            this.loadData();
          },
          error: (err) => this.showMsg(err.error?.msg, true),
          complete: () => this.loadData()
        });
      }
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  private showMsg(testo: string, errore: boolean): void {
    this.snack.open(testo, 'OK', {
      duration: 3000,
      panelClass: errore ? 'snack-errore' : 'snack-success'
    });
  }
} 