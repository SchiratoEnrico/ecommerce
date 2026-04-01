import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { StatoOrdine } from '../../../models/stato-ordine';
import { MatTableDataSource } from '@angular/material/table';
import { StatoOrdineServices } from '../../../services/stato-ordine-services';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { StatoOrdineDialog } from '../dialogs/stato-ordine-dialog/stato-ordine-dialog';
import { MatPaginator } from '@angular/material/paginator';

@Component({
  selector: 'app-gestione-stato-ordine',
  standalone: false,
  templateUrl: './gestione-stato-ordine.html',
  styleUrl: './gestione-stato-ordine.css',
})
export class GestioneStatoOrdine implements OnInit{
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  displayedColumns: string[] = ['id', 'statoOrdine'];
  dataSource = new MatTableDataSource<StatoOrdine>();

  constructor(
    private statoOrdineServices: StatoOrdineServices,
    private snack: MatSnackBar,
    private dialog: MatDialog, 
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadData();
  }
  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  loadData() {
    this.statoOrdineServices.list().subscribe({
    next: (data) => {
      this.dataSource.data = data;
      setTimeout(() => this.cdr.detectChanges()); 
    },
    error: () => this.showMsg('Errore nel caricamento degli stati ordine', true),
    });
  }
  openCreateDialog() {
    const dialogRef = this.dialog.open(StatoOrdineDialog,{
      width: '400px',
      data: null
    });
    
    dialogRef.afterClosed().subscribe((result: any) => {
      if (!result) return;
      this.statoOrdineServices.create(result).subscribe({
        next: (res: any) => this.showMsg(res.msg, false),
        error: (err) => this.showMsg(err.error?.msg, true),
        complete: () => this.loadData()
      });
    });
  }

    modificaStatoOrdine(statoOrdine: StatoOrdine): void {
      const dialogRef = this.dialog.open(StatoOrdineDialog, {
        width: '400px',
        data: statoOrdine
      });

      dialogRef.afterClosed().subscribe((result: any) => {
        if (!result) return;
        if (result.action === 'delete') {
          this.statoOrdineServices.delete(result.id).subscribe({
            next: (res: any) => this.showMsg(res.msg, false),
            error: (err) => this.showMsg(err.error?.msg, true),
            complete: () => this.loadData()
          });
        }
        if (result.action === 'save') {
          this.statoOrdineServices.update({
            id: statoOrdine.id,
            ...result}).subscribe({
            next: (res: any) => this.showMsg(res.msg, false),
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
